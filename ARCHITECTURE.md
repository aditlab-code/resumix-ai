# Architecture Specification: CV ATS Pipeline

Dokumen ini menjelaskan arsitektur sistem, batas layanan (*service boundaries*), alur pemrosesan data asinkron, skema database, serta standar teknis untuk proyek **CV ATS Pipeline**.

---

## 1. Ringkasan Arsitektur

Sistem ini dibangun dengan arsitektur **Decoupled Microservices / Monorepo** sebagai *decision-support tool* bagi tim HR (bukan mesin penentu keputusan rekrutmen otomatis).

```mermaid
graph TD
    User[HR / Admin Web UI] -->|HTTPS / REST| API[Node.js Core API / BFF - Port 3000]
    API -->|Signed URL / Private Upload| Storage[(Supabase Storage Private Bucket)]
    API -->|Persist Data & Metadata| DB[(PostgreSQL + pgvector)]
    API -->|Enqueue Processing Job| Queue[(Redis / BullMQ Queue)]
    Queue -->|Worker Task| Worker[Async Job Worker]
    Worker -->|HTTP REST| AIService[FastAPI AI Microservice - Port 8000]
    
    subgraph AI Processing Microservice Pipeline
        AIService -->|1. /v1/cv/extract-text| PyMuPDF[PyMuPDF Text Extractor]
        PyMuPDF -->|Reject if len==0| Reject[HTTP 400 NO_TEXT_LAYER -> needs_review]
        AIService -->|2. /v1/cv/llm-extract| LLM[Groq LLM - llama-3.1-8b-instant]
        AIService -->|3. /v1/cv/normalize-skills| Normalizer[Skill Synonym Dictionary]
        AIService -->|4. /v1/cv/calculate-score| Scoring[Deterministic Scoring Engine]
    end

    AIService -->|Return Structured Extraction + Score| Worker
    Worker -->|Save Extraction & Score| DB
```

---

## 2. Service Boundaries & Real Implementation

| Service | Komponen & Teknologi | Tanggung Jawab Utama | Hal yang Dilarang |
| :--- | :--- | :--- | :--- |
| **Frontend** | `apps/web`<br>(Next.js 14, TypeScript, Tailwind CSS) | UI/UX HR, form lowongan, dropzone upload CV, tracking status, preview PDF via signed URL, review/edit hasil AI. | Memegang LLM/Database secrets, menghitung skor otoritatif, query langsung ke DB. |
| **Core API** | `apps/api`<br>(Node.js, Express, TypeScript) | Express server (Port 3000). Routing REST `/api/v1`, Auth/RBAC, CRUD domain (Jobs, Candidates, Applications), signed URL, orkestrasi queue. | Parsing PDF/OCR/LLM langsung pada HTTP request handler sinkron. |
| **Queue Worker** | `apps/api/src/worker`<br>(Redis, BullMQ Worker) | Konsumsi job asinkron dari queue, retry management, koordinasi eksekusi pipeline AI, update status di PostgreSQL. | Mengubah status keputusan kandidat (`hired`/`rejected`) secara otomatis. |
| **AI Microservice** | `apps/ai-service`<br>(FastAPI, Python 3.11+) | Microservice REST (Port 8000). Ekstraksi PDF PyMuPDF murni (zero-text rejection), Groq LLM parsing (`llama-3.1-8b-instant`), normalisasi skill, kalkulasi skor. | Menulis/membaca langsung ke database utama tanpa lewat kontrak REST API API/Worker. |
| **Database** | `database`<br>(PostgreSQL 15+ + `pgvector` & `uuid-ossp`) | Storage relasional ternormalisasi (12 tabel), similarity vector search (dimensi 384), audit log. | Menyimpan berkas PDF mentah secara langsung di tabel SQL. |
| **Private Storage** | Supabase Storage / S3 Private Bucket | Penyimpanan berkas PDF CV secara privat dan aman. | Menjadikan bucket publik tanpa Signed URL berdurasi terbatas. |

---

## 3. Detail Endpoint & REST Interface

### Core API (`apps/api`)
- `GET /` — Root API service status.
- `GET /health` — Health check endpoint API.
- `GET /api/v1/jobs` — Mengambil daftar lowongan kerja.
- `POST /api/api/v1/jobs/:jobId/applications` — Ingestion upload CV asinkron (mengembalikan response `< 200ms` dengan `processing_status: queued`).

### AI Microservice (`apps/ai-service`)
- `GET /health` — Status kesehatan service dan penyedia LLM (Groq `llama-3.1-8b-instant`).
- `POST /v1/cv/extract-text` — Menerima file PDF (max 10MB), mengekstrak teks via PyMuPDF. Jika PDF tidak memiliki layer teks (`len(text.strip()) == 0`), mengembalikan HTTP 400 `NO_TEXT_LAYER` dan merekomendasikan `parse_status: needs_review`.
- `POST /v1/cv/llm-extract` — Parsing teks CV ke JSON terstruktur via Groq LLM.
- `POST /v1/cv/normalize-skills` — Normalisasi kamus sinonim skill deterministik.
- `POST /v1/cv/calculate-score` — Menghitung *job-fit score* (0–100) dan breakdown kecocokan kriteria.

---

## 4. Workflows Asinkron Ingestion & AI Pipeline

```text
[Client / HR] Upload PDF CV
   │
   ├──> Node.js API (/api/v1/jobs/:jobId/applications)
   │     ├─> Validasi file (MIME type application/pdf, max size 10MB)
   │     ├─> Simpan PDF ke Private Object Storage (cv-files/raw/...)
   │     ├─> Buat record `applications` (status: applied) & `candidate_documents` (parse_status: uploaded)
   │     ├─> Push job ke Redis Queue (`processing_jobs` status: queued)
   │     └─> Return response HTTP 202 Accepted secara cepat (< 200ms)
   │
[Worker Process]
   │
   ├──> Ambil job dari Redis Queue (update parse_status: processing)
   ├──> Panggil FastAPI AI Microservice:
   │     ├─> 1. /v1/cv/extract-text (PyMuPDF Text Extraction -> Rejects if len(text)==0 with HTTP 400 NO_TEXT_LAYER)
   │     │      └─> Jika NO_TEXT_LAYER: Update parse_status ke `needs_review` untuk tindakan HR
   │     ├─> 2. /v1/cv/llm-extract (Groq llama-3.1-8b-instant -> Strict JSON Schema)
   │     ├─> 3. /v1/cv/normalize-skills (Skill synonym normalization)
   │     └─> 4. /v1/cv/calculate-score (Calculates job-fit breakdown: 45% semantic, 30% mandatory skills, 20% experience, 5% preferred skills)
   ├──> Simpan `parsed_cv_json`, `candidate_skills`, `profile_embedding`, & `score_breakdown` ke PostgreSQL
   └──> Update parse_status ke `processed` (atau `needs_review` / `failed`)
```

---

## 5. Skema Database (PostgreSQL + pgvector)

Database terdiri dari 12 tabel utama yang didefinisikan dalam `database/migrations/001_initial_schema.sql`:

1. `users`: Akun pengguna HR/Admin (role: `admin`, `hr_recruiter`, `hiring_manager`, `viewer`).
2. `candidates`: Metadata profil kandidat, JSON snapshot hasil ekstraksi, dan `profile_embedding` (`vector(384)`).
3. `candidate_documents`: Tracking berkas PDF, `storage_path`, hash file, raw text, dan `parse_status`.
4. `candidate_skills`: Skill teridentifikasi & hasil normalisasi per kandidat.
5. `candidate_experiences`: Riwayat posisi, perusahaan, durasi bulan, dan deskripsi kerja.
6. `candidate_educations`: Riwayat pendidikan (S3, S2, S1, D3, SMA/SMK).
7. `job_postings`: Data lowongan kerja, kualifikasi minimum, dan `job_embedding` (`vector(384)`).
8. `job_required_skills`: Daftar skill wajib (*mandatory*) dan opsional (*preferred*) per lowongan.
9. `applications`: Hubungan kandidat dan lowongan, `status` rekrutmen, `job_fit_score`, dan `score_breakdown`.
10. `processing_jobs`: Queue status pemrosesan dokumen (`uploaded`, `queued`, `processing`, `processed`, `needs_review`, `failed`).
11. `score_versions`: Versioning konfigurasi dan formula scoring.
12. `audit_logs`: Log jejak audit tindakan penting sistem.

---

## 6. Formula Job-Fit Scoring

Scoring Engine menghitung skor akhir (rentang 0–100) secara deterministik:

$$\text{Final Score} = 100 \times (0.45 \times S_{\text{sem}} + 0.30 \times S_{\text{man}} + 0.20 \times S_{\text{exp}} + 0.05 \times S_{\text{pref}})$$

- $S_{\text{sem}}$: Similarity kosinus antar vector embedding candidate profile & job posting (0.0 – 1.0).
- $S_{\text{man}}$: Rasio kecocokan skill wajib ($\frac{\text{matched mandatory}}{\text{total mandatory}}$).
- $S_{\text{exp}}$: Rasio durasi pengalaman ($\min(1.0, \frac{\text{candidate experience}}{\text{required experience}})$).
- $S_{\text{pref}}$: Rasio kecocokan skill opsional ($\frac{\text{matched preferred}}{\text{total preferred}}$).

---

## 7. Keamanan Data & PII Guidelines

1. **Private Object Storage**: Berkas CV disimpan privat. Akses file untuk preview PDF menggunakan Temporary Signed URL dengan TTL maksimum 300 detik.
2. **Kerahasiaan PII**: Log internal dan telemetry dilarang mencetak isi teks mentah CV atau PII (email/telepon/alamat lengkap).
3. **Penyimpanan Secret**: Secret key (`LLM_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`) hanya dikonfigurasi melalui `.env` dan dilarang dikomit ke repo.
4. **Fairness**: Atribut sensitif (foto, jenis kelamin, usia, agama, status pernikahan) tidak boleh mempengaruhi perhitungan skor.

---

## 8. Struktur Monorepo Workspace

```text
cv-ats-pipeline/
├── apps/
│   ├── web/                         # Next.js 14 Frontend (TypeScript + Tailwind CSS)
│   ├── api/                         # Node.js Express Core API & Redis Worker
│   └── ai-service/                  # FastAPI Python AI Microservice
├── packages/
│   ├── contracts/                   # Shared DTOs & OpenAPI Contracts
│   └── config/                      # Base TSConfig & ESLint Configurations
├── database/
│   ├── migrations/                  # PostgreSQL SQL Migrations (001_initial_schema.sql)
│   ├── seeds/                       # Seed data untuk development
│   └── functions/                   # Stored Procedures & Vector Search Queries
├── docs/
│   ├── architecture.md              # Salinan Dokumen Arsitektur
│   ├── api.md                       # Spesifikasi REST API
│   ├── scoring.md                   # Spesifikasi Scoring Engine
│   └── security.md                  # Keamanan & Kebijakan PII
├── docker-compose.yml               # Production Orchestration
├── docker-compose.dev.yml           # Development Environment with Hot-Reload
├── ARCHITECTURE.md                  # Master Architecture Specification
├── AGENTS.md                        # Operational Guidelines for AI Agents
└── README.md                        # Monorepo Project Overview
```
