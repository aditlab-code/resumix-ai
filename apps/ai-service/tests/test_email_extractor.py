import pytest
from app.services.email_extractor import extract_email, is_valid_candidate_email


def test_extract_valid_emails():
    sample_text1 = "Aditia Wicaksono | aditia.wicaksono@gmail.com | +62 812-3456-7890"
    assert extract_email(sample_text1) == "aditia.wicaksono@gmail.com"

    sample_text2 = "Contact: budi.santoso_99@yahoo.co.id (Jakarta, Indonesia)"
    assert extract_email(sample_text2) == "budi.santoso_99@yahoo.co.id"

    sample_text3 = "Email: jane.doe [at] company.org | Phone: 0811223344"
    assert extract_email(sample_text3) == "jane.doe@company.org"


def test_ignore_dummy_example_emails():
    sample_dummy1 = "Full Name | user@example.com | 0812345678"
    # Should ignore user@example.com
    assert extract_email(sample_dummy1) is None

    sample_dummy2 = "Contact email@example.com for info"
    assert extract_email(sample_dummy2) is None

    assert is_valid_candidate_email("user@example.com") is False
    assert is_valid_candidate_email("email@example.com") is False
    assert is_valid_candidate_email("budi@gmail.com") is True


def test_empty_or_invalid_text():
    assert extract_email("") is None
    assert extract_email("No email present in this text block") is None
