import os
import pymupdf
import pytest
from app.schemas.cv_schema import Education, CVExtraction
from app.services.pdf_extractor import extract_pdf_text, clean_pdf_text

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "benchmark_dataset_v2"))


def test_education_schema_supports_gpa():
    edu = Education(
        institution="Universitas Gadjah Mada",
        degree="Sarjana (S1)",
        major="Teknik Informatika",
        start_year=2018,
        end_year=2022,
        gpa=3.85
    )
    assert edu.institution == "Universitas Gadjah Mada"
    assert edu.gpa == 3.85

    cv = CVExtraction(education=[edu])
    assert cv.education[0].gpa == 3.85


def test_pdf_extractor_multi_column_sorting():
    # Test reading sample multi-column PDFs with sort=True
    sample_2col = os.path.join(DATASET_DIR, "cv_101_two_col.pdf")
    sample_3col = os.path.join(DATASET_DIR, "cv_136_three_col.pdf")

    if os.path.exists(sample_2col):
        with open(sample_2col, "rb") as f:
            text_2col, meta_2col = extract_pdf_text(f.read())
            assert "EDUCATION" in text_2col or "PENDIDIKAN" in text_2col
            assert "Universitas" in text_2col

    if os.path.exists(sample_3col):
        with open(sample_3col, "rb") as f:
            text_3col, meta_3col = extract_pdf_text(f.read())
            assert "PENDIDIKAN" in text_3col
            assert "Universitas Gadjah Mada" in text_3col
