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
