import os
import json
import pytest
from tests.run_benchmark_suite import RESULTS_JSON_PATH, run_benchmark


def test_run_benchmark_suite_execution():
    run_benchmark()

    assert os.path.exists(RESULTS_JSON_PATH)

    with open(RESULTS_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert "summary" in data
    assert "results" in data

    summary = data["summary"]
    assert summary["total_documents"] >= 50
    assert summary["scanned_rejected_http400"] >= 4
    assert summary["outlier_candidates"] >= 5

    # Check outlier scores are all below 35.0 and domain_warning is True
    for res in data["results"]:
        if res.get("is_outlier") and res["status"] == "processed":
            assert res["final_score"] < 35.0
            assert res["domain_warning"] is True
