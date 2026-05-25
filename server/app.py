from pathlib import Path
import re
from tempfile import TemporaryDirectory
from urllib.parse import quote
from zipfile import ZIP_DEFLATED, ZipFile

import fitz
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from starlette.concurrency import run_in_threadpool


def ensure_pymupdf_rect_compat() -> None:
    if hasattr(fitz.Rect, "get_area"):
        return

    def get_area(self, unit: str = "px") -> float:
        width = max(0.0, float(self.x1) - float(self.x0))
        height = max(0.0, float(self.y1) - float(self.y0))
        area = width * height
        factors = {
            "px": 1.0,
            "in": 1 / (72 * 72),
            "cm": (2.54 / 72) ** 2,
            "mm": (25.4 / 72) ** 2
        }
        return area * factors.get(unit, 1.0)

    fitz.Rect.get_area = get_area


ensure_pymupdf_rect_compat()

from pdf2docx import Converter


DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
MAX_UPLOAD_BYTES = 80 * 1024 * 1024
MODE_EDITABLE = "editable_open_source"
MODE_VISUAL = "visual_exact"
SUPPORTED_MODES = {MODE_EDITABLE, MODE_VISUAL}
RENDER_ZOOM = 2.2
DOCX_TEXT_FONT = "Microsoft YaHei"
DOCX_EAST_ASIA_FONT = "微软雅黑"
RFONTS_RE = re.compile(rb"<w:rFonts\b[^>]*/>")
LANG_RE = re.compile(rb"<w:lang\b[^>]*/>")

app = FastAPI(title="Niuma conversion service")


def safe_docx_name(filename: str) -> str:
    stem = Path(filename or "converted").stem.strip() or "converted"
    return f"{stem}.docx"


async def save_upload(upload: UploadFile, target: Path) -> None:
    size = 0

    with target.open("wb") as output:
        while True:
            chunk = await upload.read(1024 * 1024)
            if not chunk:
                break

            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                raise HTTPException(status_code=413, detail="文件超过 80MB，请拆分后再转换。")

            output.write(chunk)

    if size == 0:
        raise HTTPException(status_code=400, detail="上传文件为空。")


def convert_editable_open_source(input_path: Path, output_path: Path) -> None:
    """Use LibreOffice for high-quality PDF to DOCX conversion, fall back to pdf2docx."""
    import shutil
    import subprocess

    soffice = shutil.which("soffice") or shutil.which("libreoffice")

    if soffice:
        # LibreOffice converts PDF -> DOCX with good layout preservation
        try:
            subprocess.run(
                [
                    soffice,
                    "--headless",
                    "--norestore",
                    "--convert-to", "docx:MS Word 2007 XML",
                    "--outdir", str(output_path.parent),
                    str(input_path),
                ],
                capture_output=True,
                timeout=180,
                check=False,
            )
        except subprocess.TimeoutExpired:
            pass

        # LibreOffice outputs with the input filename stem
        lo_output = output_path.parent / f"{input_path.stem}.docx"
        if lo_output.exists() and lo_output.stat().st_size > 0:
            if lo_output != output_path:
                lo_output.rename(output_path)
            normalize_docx_text_fonts(output_path)
            return

    # Fallback to pdf2docx if LibreOffice is not available or failed
    converter = Converter(str(input_path))
    try:
        converter.convert(str(output_path), start=0, end=None, multi_processing=False)
    finally:
        converter.close()

    normalize_docx_text_fonts(output_path)


def normalize_word_xml_fonts(content: bytes) -> bytes:
    font_decl = (
        f'<w:rFonts w:ascii="{DOCX_TEXT_FONT}" '
        f'w:hAnsi="{DOCX_TEXT_FONT}" '
        f'w:eastAsia="{DOCX_EAST_ASIA_FONT}" '
        f'w:cs="{DOCX_TEXT_FONT}"/>'
    ).encode("utf-8")
    lang_decl = b'<w:lang w:val="zh-CN" w:eastAsia="zh-CN" w:bidi="zh-CN"/>'

    content = RFONTS_RE.sub(font_decl, content)
    content = LANG_RE.sub(lang_decl, content)
    return content.replace(b"MicrosoftYaHei", DOCX_TEXT_FONT.encode("utf-8"))


def normalize_docx_text_fonts(docx_path: Path) -> None:
    normalized_path = docx_path.with_suffix(".normalized.docx")

    with ZipFile(docx_path, "r") as source, ZipFile(normalized_path, "w", ZIP_DEFLATED) as target:
        for item in source.infolist():
            content = source.read(item.filename)

            if (
                item.filename.startswith("word/")
                and item.filename.endswith(".xml")
                and not item.filename.startswith("word/_rels/")
            ):
                content = normalize_word_xml_fonts(content)

            target.writestr(item, content)

    normalized_path.replace(docx_path)


def configure_section(section, width_pt: float, height_pt: float) -> None:
    section.page_width = Pt(width_pt)
    section.page_height = Pt(height_pt)
    section.top_margin = Pt(0)
    section.bottom_margin = Pt(0)
    section.left_margin = Pt(0)
    section.right_margin = Pt(0)
    section.header_distance = Pt(0)
    section.footer_distance = Pt(0)


def convert_visual_exact(input_path: Path, output_path: Path, workspace: Path) -> None:
    pdf = fitz.open(str(input_path))
    try:
        if pdf.page_count == 0:
            raise ValueError("PDF 没有可转换的页面。")

        document = Document()

        for index in range(pdf.page_count):
            page = pdf.load_page(index)
            section = document.sections[0] if index == 0 else document.add_section(WD_SECTION.NEW_PAGE)
            configure_section(section, page.rect.width, page.rect.height)

            pixmap = page.get_pixmap(matrix=fitz.Matrix(RENDER_ZOOM, RENDER_ZOOM), alpha=False)
            image_path = workspace / f"page-{index + 1}.png"
            pixmap.save(str(image_path))

            paragraph = document.add_paragraph()
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            paragraph.paragraph_format.space_before = Pt(0)
            paragraph.paragraph_format.space_after = Pt(0)
            paragraph.paragraph_format.line_spacing = 1
            paragraph.add_run().add_picture(str(image_path), width=section.page_width)

        document.save(str(output_path))
    finally:
        pdf.close()


def convert_pdf(input_path: Path, output_path: Path, mode: str, workspace: Path) -> None:
    if mode == MODE_VISUAL:
        convert_visual_exact(input_path, output_path, workspace)
        return

    convert_editable_open_source(input_path, output_path)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def libreoffice_convert(input_path: Path, output_format: str, output_path: Path) -> None:
    """Generic LibreOffice conversion."""
    import shutil
    import subprocess

    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        raise RuntimeError("LibreOffice 未安装，无法执行转换。")

    try:
        subprocess.run(
            [
                soffice,
                "--headless",
                "--norestore",
                "--convert-to", output_format,
                "--outdir", str(output_path.parent),
                str(input_path),
            ],
            capture_output=True,
            timeout=180,
            check=False,
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError("转换超时，请尝试更小的文件。")

    # LibreOffice outputs with input stem + new extension
    ext = output_format.split(":")[0] if ":" in output_format else output_format
    lo_output = output_path.parent / f"{input_path.stem}.{ext}"
    if lo_output.exists() and lo_output.stat().st_size > 0:
        if lo_output != output_path:
            lo_output.rename(output_path)
    else:
        raise RuntimeError(f"LibreOffice 转换失败，未生成 .{ext} 文件。")


@app.post("/api/word-to-pdf")
async def word_to_pdf(file: UploadFile = File(...)) -> Response:
    fname = (file.filename or "").lower()
    if not (fname.endswith(".doc") or fname.endswith(".docx")):
        raise HTTPException(status_code=400, detail="请上传 Word 文件（.doc/.docx）。")

    with TemporaryDirectory(prefix="niuma-w2p-") as tmp:
        workspace = Path(tmp)
        input_path = workspace / (file.filename or "input.docx")
        output_path = workspace / f"{input_path.stem}.pdf"

        await save_upload(file, input_path)

        try:
            await run_in_threadpool(libreoffice_convert, input_path, "pdf", output_path)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"转换失败：{exc}") from exc

        content = output_path.read_bytes()
        out_name = quote(f"{input_path.stem}.pdf")
        headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{out_name}"}
        return Response(content=content, media_type="application/pdf", headers=headers)


@app.post("/api/excel-to-csv")
async def excel_to_csv(
    file: UploadFile = File(...),
    encoding: str = Form("UTF-8"),
) -> Response:
    fname = (file.filename or "").lower()
    if not (fname.endswith(".xls") or fname.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="请上传 Excel 文件（.xls/.xlsx）。")

    with TemporaryDirectory(prefix="niuma-e2c-") as tmp:
        workspace = Path(tmp)
        input_path = workspace / (file.filename or "input.xlsx")
        output_path = workspace / f"{input_path.stem}.csv"

        await save_upload(file, input_path)

        try:
            await run_in_threadpool(
                libreoffice_convert, input_path, "csv:Text - txt - csv (StarCalc):44,34,76,1", output_path
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"转换失败：{exc}") from exc

        # Re-encode if GBK requested
        if encoding.upper() == "GBK":
            text = output_path.read_text(encoding="utf-8", errors="replace")
            output_path.write_bytes(text.encode("gbk", errors="replace"))

        content = output_path.read_bytes()
        out_name = quote(f"{input_path.stem}.csv")
        headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{out_name}"}
        return Response(content=content, media_type="text/csv", headers=headers)


@app.post("/api/csv-to-excel")
async def csv_to_excel(file: UploadFile = File(...)) -> Response:
    fname = (file.filename or "").lower()
    if not fname.endswith(".csv"):
        raise HTTPException(status_code=400, detail="请上传 CSV 文件。")

    with TemporaryDirectory(prefix="niuma-c2e-") as tmp:
        workspace = Path(tmp)
        input_path = workspace / (file.filename or "input.csv")
        output_path = workspace / f"{input_path.stem}.xlsx"

        await save_upload(file, input_path)

        try:
            await run_in_threadpool(libreoffice_convert, input_path, "xlsx", output_path)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"转换失败：{exc}") from exc

        content = output_path.read_bytes()
        xlsx_mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        out_name = quote(f"{input_path.stem}.xlsx")
        headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{out_name}"}
        return Response(content=content, media_type=xlsx_mime, headers=headers)


@app.post("/api/pdf-merge")
async def pdf_merge(files: list[UploadFile] = File(...)) -> Response:
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="请上传至少 2 个 PDF 文件。")

    with TemporaryDirectory(prefix="niuma-merge-") as tmp:
        workspace = Path(tmp)
        output_path = workspace / "merged.pdf"

        merged = fitz.open()
        try:
            for upload in files:
                if not (upload.filename or "").lower().endswith(".pdf"):
                    continue
                file_path = workspace / (upload.filename or f"file-{id(upload)}.pdf")
                await save_upload(upload, file_path)
                doc = fitz.open(str(file_path))
                merged.insert_pdf(doc)
                doc.close()

            if merged.page_count == 0:
                raise HTTPException(status_code=400, detail="没有有效的 PDF 页面可合并。")

            merged.save(str(output_path))
        finally:
            merged.close()

        content = output_path.read_bytes()
        headers = {"Content-Disposition": "attachment; filename*=UTF-8''merged.pdf"}
        return Response(content=content, media_type="application/pdf", headers=headers)


@app.post("/api/pdf-split")
async def pdf_split(
    file: UploadFile = File(...),
    start: int = Form(1),
    end: int = Form(-1),
) -> Response:
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="请上传 PDF 文件。")

    with TemporaryDirectory(prefix="niuma-split-") as tmp:
        workspace = Path(tmp)
        input_path = workspace / "input.pdf"
        output_path = workspace / "split.pdf"

        await save_upload(file, input_path)

        pdf = fitz.open(str(input_path))
        try:
            total = pdf.page_count
            s = max(0, start - 1)
            e = total if end == -1 else min(end, total)

            if s >= e:
                raise HTTPException(status_code=400, detail="页码范围无效。")

            split_doc = fitz.open()
            split_doc.insert_pdf(pdf, from_page=s, to_page=e - 1)
            split_doc.save(str(output_path))
            split_doc.close()
        finally:
            pdf.close()

        content = output_path.read_bytes()
        stem = Path(file.filename or "split").stem
        out_name = quote(f"{stem}_p{start}-{end if end != -1 else 'end'}.pdf")
        headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{out_name}"}
        return Response(content=content, media_type="application/pdf", headers=headers)


@app.post("/api/pdf-to-image")
async def pdf_to_image(
    file: UploadFile = File(...),
    image_type: str = Form("png"),
    page_range: str = Form("all"),
) -> Response:
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="请上传 PDF 文件。")

    with TemporaryDirectory(prefix="niuma-p2i-") as tmp:
        workspace = Path(tmp)
        input_path = workspace / "input.pdf"
        await save_upload(file, input_path)

        pdf = fitz.open(str(input_path))
        try:
            total = pdf.page_count
            if page_range == "first":
                pages = [0]
            else:
                pages = list(range(total))

            image_paths = []
            for i in pages:
                page = pdf.load_page(i)
                pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0), alpha=False)
                ext = "png" if image_type.lower() == "png" else "jpg"
                img_path = workspace / f"page-{i + 1}.{ext}"
                if ext == "jpg":
                    pix.save(str(img_path), output="jpeg")
                else:
                    pix.save(str(img_path))
                image_paths.append(img_path)
        finally:
            pdf.close()

        if len(image_paths) == 1:
            content = image_paths[0].read_bytes()
            mime = "image/png" if image_type.lower() == "png" else "image/jpeg"
            ext = "png" if image_type.lower() == "png" else "jpg"
            stem = Path(file.filename or "page").stem
            out_name = quote(f"{stem}.{ext}")
            headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{out_name}"}
            return Response(content=content, media_type=mime, headers=headers)

        # Multiple pages -> zip
        zip_path = workspace / "pages.zip"
        with ZipFile(zip_path, "w", ZIP_DEFLATED) as zf:
            for img_path in image_paths:
                zf.write(img_path, img_path.name)

        content = zip_path.read_bytes()
        stem = Path(file.filename or "pages").stem
        out_name = quote(f"{stem}_images.zip")
        headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{out_name}"}
        return Response(content=content, media_type="application/zip", headers=headers)


@app.post("/api/image-ocr")
async def image_ocr(
    file: UploadFile = File(...),
    language: str = Form("chi_sim"),
) -> Response:
    import json
    import subprocess
    import shutil

    fname = (file.filename or "").lower()
    valid_exts = (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff")
    if not any(fname.endswith(ext) for ext in valid_exts):
        raise HTTPException(status_code=400, detail="请上传图片文件。")

    tesseract = shutil.which("tesseract")
    if not tesseract:
        raise HTTPException(status_code=500, detail="OCR 服务未安装（tesseract 未找到），请联系管理员。")

    with TemporaryDirectory(prefix="niuma-ocr-") as tmp:
        workspace = Path(tmp)
        input_path = workspace / (file.filename or "input.png")
        output_base = workspace / "result"

        await save_upload(file, input_path)

        # Map language option
        lang_map = {"中文优先": "chi_sim", "中英混排": "chi_sim+eng"}
        lang = lang_map.get(language, language)

        try:
            result = await run_in_threadpool(
                subprocess.run,
                [tesseract, str(input_path), str(output_base), "-l", lang, "--psm", "6"],
                capture_output=True,
                timeout=60,
            )
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=500, detail="OCR 识别超时，请尝试更小的图片。")

        output_file = workspace / "result.txt"
        if not output_file.exists():
            stderr = result.stderr.decode("utf-8", errors="replace") if result else ""
            raise HTTPException(status_code=500, detail=f"OCR 识别失败：{stderr[:200]}")

        text = output_file.read_text(encoding="utf-8").strip()

        return Response(
            content=json.dumps({"text": text}, ensure_ascii=False),
            media_type="application/json",
        )


@app.post("/api/pdf-watermark")
async def pdf_watermark(
    file: UploadFile = File(...),
    text: str = Form("仅供内部使用"),
    position: str = Form("居中斜排"),
) -> Response:
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="请上传 PDF 文件。")

    with TemporaryDirectory(prefix="niuma-wm-") as tmp:
        workspace = Path(tmp)
        input_path = workspace / "input.pdf"
        output_path = workspace / "watermarked.pdf"
        await save_upload(file, input_path)

        pdf = fitz.open(str(input_path))
        try:
            for page in pdf:
                rect = page.rect
                fontsize = min(rect.width, rect.height) * 0.06

                if position == "页脚":
                    point = fitz.Point(rect.width / 2, rect.height - 30)
                    rotate = 0
                elif position == "右上角":
                    point = fitz.Point(rect.width - 20, 40)
                    rotate = 0
                else:  # 居中斜排
                    point = fitz.Point(rect.width / 2, rect.height / 2)
                    rotate = -45

                page.insert_text(
                    point,
                    text,
                    fontsize=fontsize,
                    fontname="china-s",
                    color=(0.6, 0.6, 0.6),
                    rotate=rotate,
                    overlay=True,
                )

            pdf.save(str(output_path))
        finally:
            pdf.close()

        content = output_path.read_bytes()
        stem = Path(file.filename or "watermarked").stem
        out_name = quote(f"{stem}_watermarked.pdf")
        headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{out_name}"}
        return Response(content=content, media_type="application/pdf", headers=headers)


@app.post("/api/pdf-to-word")
async def pdf_to_word(
    file: UploadFile = File(...),
    mode: str = Form(MODE_EDITABLE)
) -> Response:
    if mode not in SUPPORTED_MODES:
        raise HTTPException(status_code=400, detail="未知转换方案。")

    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="请上传 PDF 文件。")

    with TemporaryDirectory(prefix="niuma-pdf-") as tmp:
        workspace = Path(tmp)
        input_path = workspace / "input.pdf"
        output_name = safe_docx_name(file.filename)
        output_path = workspace / output_name

        await save_upload(file, input_path)

        try:
            await run_in_threadpool(convert_pdf, input_path, output_path, mode, workspace)
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"转换失败：{exc}") from exc

        if not output_path.exists() or output_path.stat().st_size == 0:
            raise HTTPException(status_code=500, detail="转换失败：没有生成有效 Word 文件。")

        content = output_path.read_bytes()
        encoded_name = quote(output_name)
        headers = {
            "Content-Disposition": f"attachment; filename=\"converted.docx\"; filename*=UTF-8''{encoded_name}"
        }
        return Response(content=content, media_type=DOCX_MIME, headers=headers)
