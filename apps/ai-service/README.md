---
title: Resumix AI Microservice
emoji: 🤖
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8000
---

# Resumix AI Microservice (FastAPI + PyMuPDF + SentenceTransformers + Groq)

FastAPI Microservice responsible for PDF text extraction, zero-text rejection validation, deterministic skill normalization, 384-dimensional dual vector embedding generation (`candidate_skill_embedding` & `candidate_role_embedding`), and multi-factor job-fit scoring engine.

---

## Service Responsibilities & Features

1. **Zero-Text Short-Circuit Rule**: Instantly rejects scanned/textless PDF files (`HTTP 400 NO_TEXT_LAYER`) without burning LLM inference credits.
2. **PII-Safe LLM Extraction**: Structured resume extraction using Pydantic schemas via Groq LLM (`llama-3.1-8b-instant`). Sensitive PII attributes (photo, gender, age, religion) are excluded by design.
3. **Deterministic Skill Normalizer**: Standardizes skill keywords (e.g. `"NodeJS"`, `"Node.js"`, `"Node JS"`) using a static & dynamic taxonomy dictionary.
4. **Dual-Vector Embedding Engine**: Computes 384-dimensional SentenceTransformers embeddings (`all-MiniLM-L6-v2` / `paraphrase-multilingual-MiniLM-L12-v2`) for candidate profile, skills, and roles.
5. **Multi-Factor Scoring Engine**: Calculates transparent match scores (0–100) combining Dual-Vector Cosine Similarity (45%), Mandatory Skill Match (30%), Experience Match (20%), and Preferred Skill Bonus (5%) with strict missing mandatory skill penalties.

---

## Key API Endpoints

- `GET /health` — Service health, Groq LLM status, and embedding model availability.
- `POST /v1/cv/extract-text` — Extract raw text layer from PDF uploads.
- `POST /v1/cv/llm-extract` — Parse raw text to structured JSON via Pydantic & Groq.
- `POST /v1/cv/normalize-skills` — Map skill variants to standardized taxonomies.
- `POST /v1/cv/generate-embedding` — Generate 384-dim dual vector embeddings.
- `POST /v1/cv/calculate-score` — Compute explainable job-fit score breakdown.
- `POST /v1/job/extract-qualifications` — Parse raw job descriptions into structured qualifications & embeddings.
- `GET /v1/skills/taxonomies` — Fetch skill synonym taxonomy mappings.

---

## Local Development & Testing

```bash
# Install dependencies
pip install -r requirements.txt

# Run server locally (Port 8000)
uvicorn app.main:app --reload --port 8000

# Run unit & benchmark test suite
pytest
python tests/run_benchmark_suite.py
```
