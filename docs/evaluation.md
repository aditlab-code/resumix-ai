# AI Extraction, Robust Scoring & Benchmark Evaluation

This document outlines the evaluation methodology, performance metrics, and empirical benchmark results tested against the **200 Synthetic Resume PDF Benchmark Dataset** on the **Resumix AI** platform.

---

## 1. System Performance Metrics vs MVP Targets

| Engineering Performance Metric        | Minimum MVP Target   | Benchmark Evaluation Results                     | Verification Status   |
|:--------------------------------------|:--------------------:|:------------------------------------------------:|:----------------------|
| **JSON Validity Rate**                |      $\ge 98\%$      |      **`100%`** (Pydantic Schema Validated)      | `PASSED`              |
| **Zero-Text Rejection Rule**          |       $100\%$        |      **`100%`** (`HTTP 400 NO_TEXT_LAYER`)       | `PASSED`              |
| **Processing Pipeline Latency**       | $< 10 \text{ sec}$   |            **`~3.49 ms` / document**             | `PASSED (Ultra-Fast)` |
| **Outlier Non-IT Mismatch Detection** |       $100\%$        |    **`100%`** (Score < 35.0 & Domain Warning)    | `PASSED`              |
| **Zero Score Inflation Guarantee**    |   `Strict Penalty`   | **Verified** (25%–75% penalty missing mandatory) | `PASSED`              |

---

## 2. 200 Synthetic Resume PDF Benchmark Dataset Results

Comprehensive stress testing was executed using **200 synthetic resume PDFs** ([benchmark_dataset](../benchmark_dataset)) evaluated against verified ground-truth metadata ([metadata_ground_truth.csv](../benchmark_dataset/metadata_ground_truth.csv)).

### Summary Statistics

| Evaluation Metric                         | Benchmark Result Value | Analytical Explanation                              |
|-------------------------------------------|------------------------|-----------------------------------------------------|
| **Total Evaluated Resume PDFs**           | `200 Documents`        | Heterogeneous Dataset (Tech, Non-Tech, Scanned)     |
| **Processed Documents (Text Layer)**      | `192 Documents`        | Extracted via PyMuPDF Text Engine                   |
| **Scanned PDFs Rejected (`HTTP 400`)**    | `8 Documents`          | 100% Zero-Text Short-Circuit Rule                   |
| **Detected Non-IT Outlier Candidates**    | `40 Documents`         | Teachers, Chefs, Nurses, Accountants, Sales         |
| **Average Processing Pipeline Latency**   | `3.49 ms / document`   | End-to-End Processing Speed                         |
| **Population Mean Score (All 200 CVs)**   | `35.5 / 100`           | Population average across diverse synthetic samples |
| **Highest / Lowest Final Fit Score**      | `90.5 / 4.8`           | Dynamic range 0.0 - 100.0 without artificial inflation |

---

## 3. Score Distribution Analysis by Relevance Tier (Explaining the 35.5 Mean)

| Candidate Relevance Tier                          | Document Count | Final Score Range | Mean Fit Score | System Evaluation Outcome                       |
|---------------------------------------------------|----------------|-------------------|----------------|-------------------------------------------------|
| **Tier 1: High Target Fit (Python/Backend)**      | 19 CVs         | `70.9 - 90.5`     | **`78.8`**     | **Very High (Primary Screening Qualified)**     |
| **Tier 2: Other Tech Roles (UI/UX, Mobile, PM)**  | 133 CVs        | `6.6 - 68.0`      | **`34.5`**     | **Moderate-Low (Mandatory Skill Penalty Applied)**|
| **Tier 3: Non-IT Outliers (Teacher, Chef, Nurse)**| 40 CVs         | `4.8 - 28.4`      | **`18.2`**     | **Very Low (Domain Mismatch Warning Flagged)**  |
| **Tier 4: Scanned Image PDFs (Zero-Text)**        | 8 CVs          | `0.0`             | **`0.0`**      | **Automated Rejection (`HTTP 400 NO_TEXT_LAYER`)**|

---

## 4. Layout Geometry Stress Testing

| PDF Layout Profile            | Sample Size | Rejection Rate            | Average Fit Score | Evaluation Status      |
|-------------------------------|-------------|---------------------------|-------------------|------------------------|
| **ATS Clean Layout**          | 60 PDFs     | 0% Rejection (Text Layer) | `37.3`            | `PASSED`               |
| **HARVARD Standard**          | 40 PDFs     | 0% Rejection (Text Layer) | `32.7`            | `PASSED`               |
| **TWO_COL Balanced**          | 35 PDFs     | 0% Rejection (Text Layer) | `35.1`            | `PASSED`               |
| **THREE_COL Sidebar**         | 25 PDFs     | 0% Rejection (Text Layer) | `30.9`            | `PASSED`               |
| **FUNCTIONAL Layout**         | 12 PDFs     | 0% Rejection (Text Layer) | `42.7`            | `PASSED`               |
| **ACADEMIC Layout**           | 10 PDFs     | 0% Rejection (Text Layer) | `38.5`            | `PASSED`               |
| **MESSY_EDGE Layout**         | 10 PDFs     | 0% Rejection (Text Layer) | `36.9`            | `PASSED`               |
| **Scanned Image (Zero-Text)** | 8 PDFs      | 100% Rejection (HTTP 400) | `0.0`             | `PASSED (Strict Rule)` |

---

## 5. Non-IT Outlier Candidates Stress Testing

| Outlier Role / Profession            | Matched Skill Keywords | Missing Mandatory Skills     | Penalty Factor | Final Score | Domain Warning |
|--------------------------------------|------------------------|------------------------------|----------------|-------------|----------------|
| `Executive Chef & Pastry Specialist` | `Python`               | `PostgreSQL, Docker`         | `0.50`         | **`24.6`**  | `PASSED`       |
| `Staff Nurse (Inpatient Care)`       | `Python`               | `PostgreSQL, Docker`         | `0.50`         | **`16.0`**  | `PASSED`       |
| `Field Civil Engineer`               | `Kubernetes`           | `Python, PostgreSQL, Docker` | `0.25`         | **`6.5`**   | `PASSED`       |
| `Tax Accountant`                     | `Python, Kubernetes`   | `PostgreSQL, Docker`         | `0.50`         | **`17.4`**  | `PASSED`       |
| `High School Mathematics Teacher`    | `Python, Kubernetes`   | `PostgreSQL, Docker`         | `0.50`         | **`17.4`**  | `PASSED`       |
| `Real Estate Sales Manager`          | `Python`               | `PostgreSQL, Docker`         | `0.50`         | **`27.5`**  | `PASSED`       |
| `HR Generalist`                      | `Python`               | `PostgreSQL, Docker`         | `0.50`         | **`15.2`**  | `PASSED`       |

---

## 6. Comprehensive Reports & Test Scripts

* Comprehensive Visual Benchmark Report: [docs/benchmark_report.md](./benchmark_report.md)
* Automated Benchmark Test Suite Script: [apps/ai-service/tests/run_benchmark_suite.py](../apps/ai-service/tests/run_benchmark_suite.py)
