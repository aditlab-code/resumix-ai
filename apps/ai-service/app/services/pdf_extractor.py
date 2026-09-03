import os
import time
import tempfile
import subprocess
import pymupdf  # PyMuPDF

TESSDATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "tessdata")


def check_needs_ocr(
    text: str, extracted_word_count: int, readable_char_ratio: float
) -> bool:
    """Determine if text quality is poor enough to trigger Tesseract OCR fallback."""
    return (
        len(text.strip()) < 200
        or extracted_word_count < 40
        or readable_char_ratio < 0.65
    )


def run_tesseract_ocr(doc: pymupdf.Document) -> str:
    """Execute Tesseract OCR on rendered page images of a scanned PDF."""
    ocr_texts = []
    env = os.environ.copy()
    if os.path.exists(TESSDATA_PATH):
        env["TESSDATA_PREFIX"] = TESSDATA_PATH

    with tempfile.TemporaryDirectory() as tmp_dir:
        for idx, page in enumerate(doc):
            pix = page.get_pixmap(dpi=300)
            img_path = os.path.join(tmp_dir, f"page_{idx}.png")
            pix.save(img_path)

            try:
                result = subprocess.run(
                    ["tesseract", img_path, "stdout", "-l", "eng+ind", "--psm", "6"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=30,
                    env=env,
                )
                if result.returncode == 0 and result.stdout:
                    ocr_texts.append(result.stdout)
            except Exception as err:
                print(f"[OCR Warning] Error on page {idx}: {err}")

    return "\n".join(ocr_texts)


import re


def clean_ocr_text(text: str) -> str:
    """Clean common Tesseract OCR artifacts, re-join hyphenated words across line breaks, and separate section headers."""
    if not text:
        return ""

    # 1. Rejoin hyphenated words across newlines (e.g. microser-vices -> microservices)
    text = re.sub(r'([a-zA-Z]{2,})-\s*\r?\n\s*([a-zA-Z]{2,})', r'\1\2', text)

    # 2. Rejoin OCR hyphenated words within lines (e.g. Indo- Law -> IndoLaw)
    text = re.sub(r'([a-zA-Z]{2,})-\s+([a-zA-Z]{2,})', r'\1-\2', text)

    # 3. Clean OCR URL artifacts (e.g. github.comyadit -> github.com/adit)
    text = re.sub(r'github\.comy', 'github.com/', text)
    text = re.sub(r'gitlab\.comy', 'gitlab.com/', text)

    # 4. Standardize bullet symbols (+, «, “, *, •)
    text = re.sub(r'^\s*[+«“*•]\s*', '• ', text, flags=re.MULTILINE)

    # 5. Ensure line break before section headers if Tesseract joined header to paragraph
    headers = [
        'TECHNICAL SKILLS', 'PROFESSIONAL SUMMARY', 'PUBLICATIONS', 'PROJECTS',
        'EDUCATION', 'CERTIFICATIONS', 'PENGALAMAN KERJA', 'RIWAYAT PENDIDIKAN', 'KEAHLIAN TEKNIS'
    ]
    for h in headers:
        text = re.sub(rf'([^\n])\s*({h})', r'\1\n\n\2', text)

    return text


def extract_pdf_text(file_bytes: bytes) -> tuple[str, dict]:
    start_time = time.time()

    try:
        with pymupdf.open(stream=file_bytes, filetype="pdf") as doc:
            page_count = len(doc)
            full_text_list = []

            for page in doc:
                full_text_list.append(page.get_text())

            raw_text = "\n".join(full_text_list)
            word_count = len(raw_text.split())

            readable_chars = sum(1 for c in raw_text if c.isalnum() or c.isspace())
            total_chars = max(1, len(raw_text))
            readable_ratio = readable_chars / total_chars

            needs_ocr = check_needs_ocr(raw_text, word_count, readable_ratio)
            ocr_used = False

            if needs_ocr:
                ocr_text = run_tesseract_ocr(doc)
                cleaned_ocr = clean_ocr_text(ocr_text)
                if len(cleaned_ocr.strip()) > len(raw_text.strip()):
                    raw_text = cleaned_ocr
                    ocr_used = True
                    word_count = len(raw_text.split())
                    readable_chars = sum(1 for c in raw_text if c.isalnum() or c.isspace())
                    readable_ratio = readable_chars / max(1, len(raw_text))
            else:
                raw_text = clean_ocr_text(raw_text)
    except Exception as e:
        raise ValueError(f"Gagal membaca PDF: berkas rusak atau terenkripsi. Detail: {str(e)}")

    duration_ms = int((time.time() - start_time) * 1000)

    metadata = {
        "parser": "pymupdf_ocr" if ocr_used else "pymupdf",
        "ocr_used": ocr_used,
        "page_count": page_count,
        "extracted_characters": len(raw_text),
        "processing_time_ms": duration_ms,
        "quality_score": round(readable_ratio, 2),
        "needs_ocr": needs_ocr,
    }

    return raw_text, metadata
