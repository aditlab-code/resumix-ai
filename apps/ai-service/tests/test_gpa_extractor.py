import pytest
from app.services.gpa_extractor import normalize_gpa_value, extract_gpa_from_text


def test_normalize_gpa_value_comma_and_scale():
    assert normalize_gpa_value("3,85") == "3.85"
    assert normalize_gpa_value("3,75 / 4,00") == "3.75"
    assert normalize_gpa_value("3.85 / 4.00") == "3.85"
    assert normalize_gpa_value(3.92) == "3.92"
    assert normalize_gpa_value("IPK 3,60") == "3.60"
    assert normalize_gpa_value(None) is None


def test_extract_gpa_from_raw_cv_text():
    sample1 = """
    PENDIDIKAN
    Universitas Gadjah Mada (2018 - 2022)
    Sarjana Teknik Informatika — IPK 3,85 / 4,00
    """
    assert extract_gpa_from_text(sample1) == "3.85"

    sample2 = """
    Education:
    Institut Teknologi Bandung
    Bachelor of Computer Science, GPA: 3.75
    """
    assert extract_gpa_from_text(sample2) == "3.75"

    sample3 = """
    SMA Negeri 1 Bandung (2015 - 2018)
    Jurusan IPA
    """
    assert extract_gpa_from_text(sample3) is None
