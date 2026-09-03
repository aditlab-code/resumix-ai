import time
import re
import pymupdf  # PyMuPDF


def clean_pdf_text(text: str) -> str:
    """Clean text formatting artifacts, re-join hyphenated words across line breaks, and separate section headers."""
    if not text:
        return ""

    # 1. Rejoin hyphenated words across newlines (e.g. microser-vices -> microservices)
    text = re.sub(r'([a-zA-Z]{2,})-\s*\r?\n\s*([a-zA-Z]{2,})', r'\1\2', text)

    # 2. Rejoin hyphenated words within lines (e.g. Indo- Law -> IndoLaw)
    text = re.sub(r'([a-zA-Z]{2,})-\s+([a-zA-Z]{2,})', r'\1-\2', text)

    # 3. Standardize bullet symbols (+, «, “, *, •)
    text = re.sub(r'^\s*[+«“*•]\s*', '• ', text, flags=re.MULTILINE)

    # 4. Ensure line break before section headers if joined to paragraph
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
            raw_text = clean_pdf_text(raw_text)

            # Strict Zero-Text Rejection Rule
            if len(raw_text.strip()) == 0:
                raise ValueError("NO_TEXT_LAYER: Berkas PDF tidak memiliki layer teks yang dapat dibaca. Harap unggah PDF asli berbasis teks.")

            word_count = len(raw_text.split())
            readable_chars = sum(1 for c in raw_text if c.isalnum() or c.isspace())
            total_chars = max(1, len(raw_text))
            readable_ratio = readable_chars / total_chars

    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Gagal membaca PDF: berkas rusak atau terenkripsi. Detail: {str(e)}")

    duration_ms = int((time.time() - start_time) * 1000)

    metadata = {
        "parser": "pymupdf",
        "ocr_used": False,
        "page_count": page_count,
        "extracted_characters": len(raw_text),
        "word_count": word_count,
        "processing_time_ms": duration_ms,
        "quality_score": round(readable_ratio, 2),
    }

    return raw_text, metadata
