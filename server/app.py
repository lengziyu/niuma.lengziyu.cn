from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import quote

import fitz
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from pdf2docx import Converter
from starlette.concurrency import run_in_threadpool


DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
MAX_UPLOAD_BYTES = 80 * 1024 * 1024
MODE_EDITABLE = "editable_open_source"
MODE_VISUAL = "visual_exact"
SUPPORTED_MODES = {MODE_EDITABLE, MODE_VISUAL}
RENDER_ZOOM = 2.2

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
    converter = Converter(str(input_path))
    try:
        converter.convert(str(output_path), start=0, end=None, multi_processing=False)
    finally:
        converter.close()


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
