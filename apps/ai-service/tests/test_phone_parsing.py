import os
import csv
import re
import pymupdf
import pytest
from app.services.phone_extractor import extract_phone_number, normalize_phone_number

ROOT_DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "benchmark_dataset"))
LOCAL_DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "benchmark_dataset_v2"))
DATASET_DIR = ROOT_DATASET_DIR if os.path.exists(ROOT_DATASET_DIR) else LOCAL_DATASET_DIR
GROUND_TRUTH_CSV = os.path.join(DATASET_DIR, "metadata_ground_truth.csv")



def test_normalize_phone_number_mobile_and_landline():
    assert normalize_phone_number("087139854548") == "+62 871-3985-4548"
    assert normalize_phone_number("+62 880-2424-7912") == "+62 880-2424-7912"
    assert normalize_phone_number("(021) 8852574") == "(021) 8852574"
    assert normalize_phone_number("022-2501234") == "022-2501234"


def test_extract_phone_number_from_text():
    sample1 = "Full Name | user@example.com | (021) 8852574 | Jakarta"
    assert extract_phone_number(sample1) == "(021) 8852574"

    sample2 = "Contact: +62 820-1964-4750 | Malang"
    assert extract_phone_number(sample2) == "+62 820-1964-4750"

    sample3 = "Hub: 087139854548 / test@example.com"
    assert extract_phone_number(sample3) == "+62 871-3985-4548"


def test_benchmark_pdf_phone_extraction_accuracy():
    if not os.path.exists(GROUND_TRUTH_CSV):
        pytest.skip("Ground truth metadata CSV not found")

    gt_map = {}
    with open(GROUND_TRUTH_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            gt_map[row["file"]] = row

    pdf_files = sorted([f for f in os.listdir(DATASET_DIR) if f.endswith(".pdf")])
    success_count = 0
    total_text_pdfs = 0

    for fname in pdf_files:
        gt_phone = gt_map.get(fname, {}).get("phone", "")
        if not gt_phone or "scanned" in fname:
            continue
        
        total_text_pdfs += 1
        fpath = os.path.join(DATASET_DIR, fname)
        doc = pymupdf.open(fpath)
        text = doc[0].get_text("text", sort=True)
        doc.close()

        extracted = extract_phone_number(text)

        gt_digits = re.sub(r"\D", "", gt_phone)
        ext_digits = re.sub(r"\D", "", extracted)

        if gt_digits.startswith("08") and ext_digits.startswith("628"):
            ext_digits = "0" + ext_digits[2:]
        elif gt_digits.startswith("628") and ext_digits.startswith("08"):
            gt_digits = "0" + gt_digits[2:]

        if gt_digits and gt_digits == ext_digits:
            success_count += 1

    accuracy = success_count / max(1, total_text_pdfs)
    assert accuracy >= 0.95, f"Phone extraction accuracy {accuracy*100:.1f}% is below 95% threshold"
