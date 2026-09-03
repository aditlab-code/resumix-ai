# AGENTS.md

Panduan operasional untuk AI coding agent dan kontributor pada proyek **CV ATS Pipeline**: sistem Applicant Tracking System yang menerima CV, melakukan ekstraksi data berbantuan AI, menghitung job-fit score, lalu menyediakan dashboard HR untuk peninjauan kandidat.

> Prinsip utama: bangun sistem yang dapat diaudit, aman terhadap data pribadi, mudah diuji, dan tetap menempatkan manusia sebagai pengambil keputusan rekrutmen.

---

## 1. Tujuan Proyek

Sistem ini mendukung workflow berikut:

```text
HR membuat lowongan
  -> Kandidat/HR mengunggah CV PDF
  -> File disimpan secara privat
  -> Worker mengekstrak teks PDF / OCR fallback
  -> LLM menghasilkan profil kandidat terstruktur
  -> Sistem memvalidasi, menormalisasi, dan menyimpan hasil
  -> Embedding + aturan bisnis menghasilkan job-fit score
  -> HR meninjau CV, hasil ekstraksi, alasan skor, dan status aplikasi
```

Sistem ini adalah **decision-support tool**, bukan mesin keputusan otomatis. Jangan membuat fitur yang secara otomatis menerima atau menolak kandidat hanya berdasarkan skor AI.

---

## 2. Arsitektur Target

```text
[Frontend: Next.js + TypeScript]
              |
              v
[Core API: Node.js + Express]
  |           |              \
  |           |               -> [Supabase Storage: private CV files]
  |           v
  |     [PostgreSQL + pgvector]
  |
  v
[Queue / Worker]
  |
  v
[AI Service: Python + FastAPI]
  |- PDF parsing: PyMuPDF
  |- OCR fallback: Tesseract
  |- Structured extraction: LLM provider abstraction
  |- Validation: Pydantic
  |- Embedding: sentence-transformers
  |- Skill normalization and scoring helpers
```

### Service boundaries

| Service            | Tanggung jawab                                                                       | Tidak boleh menangani                                                        |
|--------------------|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| Frontend           | UI/UX HR, form, upload flow, visualisasi status dan skor                             | Secret, perhitungan scoring otoritatif, akses langsung service-role database |
| Node.js API        | Auth, authorization, domain logic, transaksi database, signed URL, orkestrasi proses | Parsing PDF/OCR/LLM langsung di request handler                              |
| Worker             | Menjalankan pekerjaan asinkron, retry terbatas, menyimpan status proses              | Menentukan keputusan rekrutmen                                               |
| FastAPI AI service | Parsing, OCR, extraction, normalization, embedding, kalkulasi sinyal AI              | Menulis langsung ke database utama tanpa melalui kontrak API/worker          |
| PostgreSQL         | Data relasional, audit, ranking/vector search                                        | Menyimpan file PDF langsung                                                  |
| Storage            | Menyimpan berkas CV privat                                                           | Menjadi bucket publik tanpa signed URL                                       |

---

## 3. Struktur Repository

Pertahankan struktur berikut kecuali ada alasan teknis yang kuat dan terdokumentasi.

```text
cv-ats-pipeline/
├── apps/
│   ├── web/                         # Next.js frontend
│   ├── api/                         # Node.js / Express core API
│   └── ai-service/                  # FastAPI AI microservice
├── packages/
│   ├── contracts/                   # OpenAPI, JSON Schema, shared DTO/contracts
│   ├── config/                      # Shared lint/tsconfig jika diperlukan
│   └── ui/                          # Shared UI components bila benar-benar diperlukan
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── functions/
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── scoring.md
│   ├── security.md
│   ├── evaluation.md
│   └── adr/
├── infra/
│   ├── docker/
│   ├── nginx/
│   └── scripts/
├── .github/
│   └── workflows/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── README.md
└── AGENTS.md
```

---

## 4. Aturan Global untuk Agent

### Sebelum mengubah kode

1. Baca `README.md`, dokumen pada `docs/`, dan kontrak API yang terkait.
2. Identifikasi service yang memiliki tanggung jawab atas perubahan tersebut.
3. Periksa migration database yang sudah ada sebelum menambah tabel/kolom.
4. Cari implementasi, test, dan pola error handling yang telah digunakan.
5. Buat perubahan sekecil mungkin yang benar-benar menyelesaikan kebutuhan.
6. Jangan mengganti stack, provider, atau pola arsitektur inti tanpa persetujuan eksplisit.

### Saat mengubah kode

1. Gunakan TypeScript strict pada frontend dan Node.js API.
2. Gunakan type hints dan Pydantic model pada Python.
3. Jangan gunakan `any` kecuali dibatasi secara lokal dan memiliki alasan jelas.
4. Jangan membuat logic bisnis penting hanya di frontend.
5. Jangan memanggil provider LLM secara langsung dari frontend.
6. Jangan menyimpan API key, token, CV mentah, atau PII dalam source code/log/test fixture.
7. Jangan mengubah kontrak API tanpa memperbarui consumer, OpenAPI, test, dan dokumentasi terkait.
8. Jangan menambah dependency besar bila kebutuhan dapat diselesaikan dengan dependency yang sudah tersedia.
9. Gunakan error message yang aman: informatif untuk pengguna, detail teknis hanya untuk log internal.
10. Untuk perubahan database, buat migration baru; jangan mengedit migration yang telah diterapkan.

### Setelah mengubah kode

1. Jalankan formatter, linter, type-check, dan test yang relevan.
2. Tambahkan atau perbarui test untuk perilaku yang berubah.
3. Pastikan error state, empty state, dan loading state ditangani pada UI yang diubah.
4. Perbarui dokumentasi bila ada endpoint, environment variable, skema, atau workflow baru.
5. Laporkan ringkasan perubahan, file yang dimodifikasi, test yang dijalankan, dan keterbatasan yang tersisa.

---

## 5. Konvensi Git dan Perubahan

### Branch

Gunakan pola:

```text
feat/<area>-<ringkasan>
fix/<area>-<ringkasan>
refactor/<area>-<ringkasan>
docs/<area>-<ringkasan>
test/<area>-<ringkasan>
chore/<area>-<ringkasan>
```

Contoh:

```text
feat/ai-cv-ocr-fallback
feat/api-application-upload
feat/web-candidate-review
fix/scoring-experience-cap
docs/architecture-diagram
```

### Commit

Gunakan Conventional Commits:

```text
feat(api): add async CV upload workflow
fix(ai): mark incomplete date ranges as warnings
test(scoring): cover missing mandatory skills
docs(readme): document local development setup
chore(ci): run Python and TypeScript lint checks
```

### Pull request

Setiap PR harus menjawab:

- Masalah atau user story yang diselesaikan.
- Service dan data model yang terdampak.
- Perubahan API atau migration, bila ada.
- Risiko terhadap keamanan/PII.
- Test yang dijalankan.
- Screenshot atau video singkat untuk perubahan UI.

---

## 6. Domain dan Status

### Status aplikasi

Gunakan nilai berikut untuk workflow rekrutmen:

```text
applied
screening
interview
rejected
hired
withdrawn
```

### Status dokumen/proses AI

Jangan mencampur status rekrutmen dengan status pemrosesan dokumen. Gunakan:

```text
uploaded
queued
processing
processed
needs_review
failed
```

### Aturan status

- `applications.status` menjelaskan tahap rekrutmen.
- `candidate_documents.parse_status` menjelaskan kondisi pemrosesan dokumen.
- Kandidat dengan dokumen `needs_review` tidak otomatis ditolak.
- Kandidat dengan dokumen `failed` tetap dapat dilihat dan diproses ulang oleh HR yang berwenang.
- Semua perubahan status penting harus tercatat dalam audit log.

---

## 7. Kontrak Data

### Prinsip data kandidat

- UUID adalah identifier internal utama.
- Email bukan satu-satunya identitas kandidat dan tidak selalu tersedia.
- Simpan file dengan `storage_path`, bukan URL publik permanen.
- Hasil LLM mentah/tervalidasi dapat disimpan sebagai snapshot JSONB untuk audit.
- Data yang sering dicari/filter harus tersedia dalam tabel relasional yang ternormalisasi.
- Simpan nilai mentah dan nilai hasil normalisasi bila normalisasi dilakukan.

### Tabel inti

Minimal data model mencakup:

```text
users
candidates
candidate_documents
candidate_skills
candidate_experiences
candidate_educations
job_postings
job_required_skills
applications
processing_jobs
audit_logs
score_versions
```

### Kolom kritis

```text
candidates:
  id, full_name, email, phone_number,
  total_experience_months, parsed_cv_json,
  profile_embedding, created_at, updated_at

candidate_documents:
  id, candidate_id, storage_path, original_filename,
  mime_type, size_bytes, file_hash, parse_status,
  raw_text, parser_metadata, uploaded_at

job_postings:
  id, title, description, minimum_experience_months,
  status, job_embedding, created_by, created_at

applications:
  id, candidate_id, job_id, document_id, status,
  job_fit_score, score_breakdown, applied_at

processing_jobs:
  id, document_id, job_type, status, attempt_count,
  error_code, error_message, started_at, completed_at
```

### Naming

- Database: `snake_case` plural untuk tabel, `snake_case` untuk kolom.
- JSON/API: `snake_case` bila backend utama menggunakannya secara konsisten, atau `camelCase` bila sudah diputuskan sebagai standar publik. Jangan mencampur tanpa adapter eksplisit.
- TypeScript: `PascalCase` untuk type/component, `camelCase` untuk variabel/function.
- Python: PEP 8, `snake_case` untuk function/module/variable, `PascalCase` untuk class.

---

## 8. AI Extraction Rules

### Pipeline ekstraksi

Urutan proses CV:

1. Validasi jenis file, ukuran file, dan jumlah halaman.
2. Simpan file ke private object storage.
3. Ekstrak teks menggunakan PyMuPDF sebagai parser utama.
4. Nilai kualitas teks hasil ekstraksi.
5. Jalankan OCR fallback hanya bila teks berkualitas buruk atau PDF berupa scan.
6. Bersihkan teks seperlunya tanpa menghilangkan fakta penting.
7. Kirim teks ke LLM untuk structured extraction.
8. Validasi output melalui Pydantic.
9. Normalisasi skill dan tanggal secara deterministik.
10. Simpan hasil, warning, metadata parser, versi model, dan status proses.

### Jangan gunakan hanya panjang teks

Keputusan OCR tidak boleh hanya berdasarkan `len(text) < 50`. Gunakan gabungan sinyal:

```python
needs_ocr = (
    len(text.strip()) < 200
    or extracted_word_count < 40
    or readable_character_ratio < 0.65
    or text_has_garbled_patterns(text)
)
```

Ambang ini harus configurable dan diuji menggunakan corpus CV anonymized.

### Skema hasil ekstraksi

Gunakan Pydantic sebagai sumber kebenaran untuk respons FastAPI. Field yang tidak diketahui harus menggunakan `None` untuk scalar/object atau `[]` untuk list, sesuai skema.

```python
class CVExtraction(BaseModel):
    full_name: str | None = None
    contact: Contact
    summary: str | None = None
    skills: list[Skill] = []
    work_experience: list[WorkExperience] = []
    education: list[Education] = []
    certifications: list[str] = []
    projects: list[str] = []
    total_experience_months: int | None = None
    extraction_warnings: list[str] = []
```

Hindari mutable default pada implementasi Pydantic bila versi dan konfigurasi proyek memerlukannya; gunakan `Field(default_factory=list)` sebagai pilihan aman.

### Aturan LLM

Prompt system harus menegaskan:

```text
- Ekstrak hanya fakta yang tertulis eksplisit pada CV.
- Jangan berhalusinasi atau mengisi kemampuan yang tidak tertulis.
- Jangan menyimpulkan senioritas, usia, gender, agama, etnis, kondisi kesehatan, atau keputusan kelayakan.
- Gunakan null atau [] saat informasi tidak ditemukan.
- Jangan menambahkan key di luar schema.
- Jika tanggal ambigu atau tidak lengkap, jangan mengarang durasi; tambahkan warning.
- Keluarkan JSON valid tanpa markdown dan tanpa narasi.
```

### Retry dan kegagalan

- Retry LLM hanya untuk error sementara atau output schema invalid.
- Batasi retry, misalnya maksimal 2 kali setelah attempt pertama.
- Jangan retry tanpa batas.
- Simpan reason/error code yang aman.
- Jika masih gagal, tandai `needs_review` atau `failed` sesuai jenis kegagalan.
- Jangan menghapus CV atau record aplikasi akibat kegagalan parsing.

---

## 9. Normalisasi Skill

### Prinsip

- Simpan skill asli yang diekstrak dari CV.
- Simpan skill hasil normalisasi untuk pencocokan internal.
- Normalisasi tidak boleh menciptakan skill yang tidak tertulis.
- Kamus sinonim harus versioned dan mudah diaudit.

Contoh:

```json
{
  "reactjs": "React",
  "react.js": "React",
  "node": "Node.js",
  "nodejs": "Node.js",
  "postgres": "PostgreSQL",
  "postgre": "PostgreSQL",
  "py": "Python"
}
```

### Contoh yang dilarang

- Mengubah `Next.js` menjadi `Senior React Engineer`.
- Menganggap `MySQL` sama dengan `PostgreSQL`.
- Menganggap pengalaman menggunakan tool sekali sebagai expertise tingkat tinggi.

---

## 10. Job-Fit Scoring Rules

### Prinsip scoring

- Skor hanya membantu screening; tidak boleh menjadi keputusan final otomatis.
- Skor akhir selalu berada pada rentang 0–100.
- Skor harus dapat dijelaskan melalui breakdown yang disimpan.
- Skill wajib harus diperlakukan berbeda dari skill preferred.
- Formula dan bobot harus versioned.
- Jangan memasukkan atribut sensitif atau proksi diskriminatif ke dalam scoring.

### Formula baseline

Gunakan baseline yang dapat diubah melalui konfigurasi versi:

```text
final_score = 100 * (
  0.45 * semantic_similarity +
  0.30 * mandatory_skill_score +
  0.20 * experience_score +
  0.05 * preferred_skill_score
)
```

Dengan:

```text
experience_score = min(1, candidate_experience_months / required_experience_months)
```

Jika `required_experience_months` kosong atau nol, tetapkan `experience_score = 1` dan dokumentasikan perilaku tersebut.

### Output breakdown wajib

```json
{
  "score_version": "v1",
  "semantic_similarity": 0.82,
  "mandatory_skill_score": 0.75,
  "experience_score": 1.0,
  "preferred_skill_score": 0.6,
  "matched_skills": ["Python", "PostgreSQL", "Docker"],
  "missing_mandatory_skills": ["Kubernetes"],
  "final_score": 84.4
}
```

### pgvector

- Gunakan vector search untuk kandidat discovery/ranking pada skala besar.
- Jangan memuat seluruh embedding ke memori aplikasi untuk pencarian top-k.
- Pastikan dimensi kolom vector konsisten dengan model embedding.
- Simpan `embedding_model` dan versi model pada metadata.
- Setelah vector search, hitung atau tampilkan rule-based score breakdown agar hasil tetap dapat dijelaskan.

---

## 11. API Rules

### Versi endpoint

Gunakan prefix:

```text
/api/v1
```

### Endpoint minimum

```text
POST   /api/v1/jobs
GET    /api/v1/jobs
GET    /api/v1/jobs/:jobId
PATCH  /api/v1/jobs/:jobId

POST   /api/v1/jobs/:jobId/applications
GET    /api/v1/jobs/:jobId/applications
GET    /api/v1/applications/:applicationId
PATCH  /api/v1/applications/:applicationId/status
POST   /api/v1/applications/:applicationId/reprocess

GET    /api/v1/jobs/:jobId/rankings
GET    /api/v1/processing-jobs/:processingJobId
PATCH  /api/v1/candidates/:candidateId
```

### Upload flow

Endpoint upload harus cepat mengembalikan respons setelah file tervalidasi, disimpan, dan pekerjaan dipasang ke queue.

Respons minimal:

```json
{
  "application_id": "uuid",
  "document_id": "uuid",
  "processing_job_id": "uuid",
  "processing_status": "queued",
  "message": "CV berhasil diunggah dan sedang diproses."
}
```

Jangan membuat client menunggu OCR, LLM extraction, embedding, dan scoring dalam satu request sinkron.

### Error response

Gunakan format konsisten:

```json
{
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Hanya file PDF yang dapat diunggah.",
    "request_id": "uuid"
  }
}
```

- Pesan pengguna menggunakan Bahasa Indonesia yang jelas.
- Jangan membocorkan stack trace, secret, URL internal, atau isi CV pada respons error.
- Simpan detail teknis di log internal dengan `request_id`/`job_id`.

---

## 12. Frontend dan UX Rules

### Prioritas layar MVP

Bangun urutan berikut:

1. Login dan role-aware layout.
2. Dashboard HR ringkas.
3. Daftar lowongan dan form create/edit lowongan.
4. Detail lowongan dengan tabel/ranking kandidat.
5. Upload CV ke lowongan.
6. Detail kandidat dengan hasil ekstraksi dan preview CV.
7. Review/edit hasil ekstraksi.
8. Penjelasan job-fit score dan perubahan status aplikasi.

### Prinsip UX

- Desktop-first untuk workflow HR yang banyak menggunakan tabel dan review dokumen.
- Informasi terpenting harus muncul di atas: status, job-fit score, mandatory skills, pengalaman, dan aksi berikutnya.
- Jangan hanya menggunakan warna untuk status; gunakan teks dan ikon.
- Selalu buat loading, empty, error, dan permission states.
- Gunakan skeleton/loading indicator pada request yang memakan waktu.
- Tampilkan progress detail saat parsing CV: `uploaded`, `queued`, `processing`, `processed`, `needs_review`, `failed`.
- Hasil AI wajib dapat diedit HR yang berwenang.
- PDF preview harus menggunakan signed URL berumur pendek.
- Jangan menampilkan raw JSON sebagai UI utama; gunakan komponen profil yang dapat dipindai manusia.
- Hindari klaim “kandidat terbaik” tanpa breakdown; tampilkan alasan kecocokan dan kriteria yang belum ditemukan.

### Komponen reusable

```text
StatusBadge
ProcessingStatusTimeline
CandidateTable
CandidateProfile
SkillChip
SkillMatchBadge
JobFitScore
ScoreBreakdown
CvUploadDropzone
ExtractionReviewForm
ResumePreview
EmptyState
ErrorState
```

### Data fetching

- Gunakan TanStack Query untuk server state bila frontend memakai React/Next.js.
- Gunakan polling terukur atau SSE/WebSocket untuk status pemrosesan.
- Jangan polling agresif; hentikan polling setelah status terminal (`processed`, `needs_review`, `failed`).
- Validasi form dengan schema yang sinkron dengan kontrak API.

---

## 13. Keamanan dan Privasi

### PII dan CV

CV mengandung Personal Identifiable Information. Perlakukan semua data kandidat sebagai data sensitif.

Wajib:

- Bucket storage privat.
- Signed URL dengan waktu kedaluwarsa singkat.
- Authentication dan Role-Based Access Control.
- Row Level Security bila memakai Supabase.
- Audit log untuk akses dan perubahan data penting.
- Rate limiting pada login, upload, dan endpoint reprocess.
- Validasi MIME type, ekstensi, ukuran, jumlah halaman, dan file signature bila memungkinkan.
- Batas ukuran file dan proteksi PDF bomb.
- Retensi serta mekanisme penghapusan/anonymization data kandidat.
- Redaksi PII pada log dan telemetry.
- Penggunaan environment variable untuk secret.

Dilarang:

- Membuat bucket CV public.
- Menaruh `SUPABASE_SERVICE_ROLE_KEY`, API key LLM, password, atau SSH key pada repository.
- Menulis isi CV mentah ke console log production.
- Menampilkan signed URL permanen di database/UI.
- Menggunakan foto, umur, gender, agama, etnis, status pernikahan, kondisi kesehatan, atau informasi sensitif lain untuk scoring.
- Mengirim data lebih banyak dari yang diperlukan ke provider AI pihak ketiga.

### Environment variables

Gunakan `.env.example` tanpa nilai rahasia:

```dotenv
NODE_ENV=development
API_PORT=3000
AI_SERVICE_URL=http://ai-service:8000
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LLM_PROVIDER=
LLM_API_KEY=
REDIS_URL=
JWT_SECRET=
SIGNED_URL_TTL_SECONDS=300
MAX_UPLOAD_SIZE_MB=10
```

---

## 14. Testing Strategy

### Minimum test per service

| Area        | Test minimum                                                                          |
|-------------|---------------------------------------------------------------------------------------|
| API Node.js | Unit test domain/service, integration endpoint, auth/authorization, validation upload |
| AI FastAPI  | Unit test parser/OCR decision, Pydantic validation, normalisasi skill, scoring        |
| Database    | Migration test, constraint, index, query ranking yang penting                         |
| Frontend    | Component test untuk state penting dan E2E untuk alur upload-review-status            |
| Worker      | Retry, idempotency, perubahan status job, kegagalan provider                          |

### Skenario wajib

1. PDF digital dengan teks normal diproses tanpa OCR.
2. PDF scan memicu OCR fallback.
3. PDF kosong/rusak menghasilkan error aman dan status `failed`.
4. LLM mengembalikan field kosong tanpa halusinasi.
5. LLM mengembalikan JSON invalid dan sistem melakukan retry terbatas.
6. CV tanpa email tetap dapat disimpan.
7. CV duplikat dapat dideteksi melalui hash tanpa merusak data aplikasi.
8. Kandidat dengan missing mandatory skill mendapat breakdown yang benar.
9. Nilai akhir tidak pernah < 0 atau > 100.
10. User tanpa hak akses tidak dapat membuka CV atau mengubah status aplikasi.
11. Reprocess tidak membuat application duplikat.
12. UI menangani `queued`, `processing`, `processed`, `needs_review`, dan `failed`.

### Corpus evaluasi AI

- Gunakan CV yang dianonimkan atau data sintetis untuk testing.
- Jangan commit CV asli kandidat.
- Simpan ground truth terpisah dari data produksi.
- Ukur JSON validity rate, field accuracy, precision/recall/F1 skill, latency, dan manual correction rate.

---

## 15. Observability dan Audit

### Logging

Gunakan structured log dengan field minimal:

```text
request_id
processing_job_id
document_id
application_id
service
operation
status
duration_ms
error_code
```

Jangan log:

```text
raw CV text
email lengkap
nomor telepon lengkap
signed URL
API key
password
token
```

### Audit log

Catat peristiwa:

```text
job_created
job_updated
cv_uploaded
cv_processing_started
cv_processing_completed
cv_processing_failed
candidate_profile_edited
application_status_changed
cv_viewed
candidate_data_deleted
```

Audit log minimal memuat actor, waktu, target entity, aksi, dan metadata aman.

---

## 16. Docker dan Deployment

### Local development

`docker-compose.dev.yml` harus dapat menjalankan minimal:

```text
web
api
ai-service
redis/queue
postgres atau koneksi Supabase development
```

### Container rules

- Setiap service memiliki Dockerfile sendiri.
- Gunakan image base yang minimal dan pinned bila memungkinkan.
- Jangan menjalankan container sebagai root bila dapat dihindari.
- Gunakan healthcheck untuk API dan AI service.
- Jangan bake secret ke image.
- Gunakan multi-stage build untuk Node.js frontend/API jika bermanfaat.

### CI

Setiap push/PR minimal menjalankan:

```text
frontend: lint + typecheck + test
api: lint + typecheck + test
ai-service: lint + test
build Docker image
migration/schema validation
secret scanning bila tersedia
```

### CD

Deployment hanya boleh berjalan dari branch yang disetujui, biasanya `main`, setelah CI sukses.

Alur CD:

```text
build image
-> push registry
-> deploy/update server
-> run migration secara terkontrol
-> restart service
-> health check
-> rollback bila health check gagal
```

Jangan menjalankan destructive migration otomatis tanpa strategi backup dan rollback.

---

## 17. Dokumentasi Wajib

Setiap fitur penting perlu memperbarui dokumen terkait.

| File                   | Isi                                                       |
|------------------------|-----------------------------------------------------------|
| `README.md`            | Ringkasan, quick start, arsitektur, screenshot, demo flow |
| `docs/architecture.md` | Service boundary, sequence diagram, keputusan utama       |
| `docs/api.md`          | Endpoint, request/response, error code, auth              |
| `docs/scoring.md`      | Formula, bobot, versi, contoh breakdown, batasan          |
| `docs/security.md`     | PII, RBAC, signed URL, retention, threat model ringkas    |
| `docs/evaluation.md`   | Dataset anonim, metrik ekstraksi/ranking, hasil evaluasi  |
| `docs/adr/`            | Architectural Decision Records untuk keputusan signifikan |

### Format ADR

```md
# ADR-001: Menggunakan asynchronous processing untuk CV extraction

## Status
Accepted

## Context
OCR dan LLM extraction dapat memakan waktu dan gagal sementara.

## Decision
Upload CV membuat processing job asinkron melalui queue/worker.

## Consequences
UI harus menangani status proses; perlu retry dan observability.
```

---

## 18. Definition of Done

Sebuah task dianggap selesai jika:

- Implementasi memenuhi acceptance criteria.
- Kontrak API, type, dan schema konsisten.
- Input tervalidasi dan error ditangani dengan aman.
- Test relevan ditambahkan atau diperbarui.
- Linter, formatter, type checker, dan test relevan lulus.
- Tidak ada secret/PII baru pada source, fixture, atau log.
- UI memiliki loading, empty, error, dan success state jika berdampak ke user.
- Dokumentasi diperbarui bila fitur mengubah API, skema, konfigurasi, keamanan, atau workflow.
- Perubahan tidak merusak service boundary atau membuat keputusan rekrutmen otomatis.

---

## 19. Roadmap Implementasi

### Sprint 1 — Foundation

- Monorepo dan Docker Compose.
- Konfigurasi TypeScript/Python linting.
- Database migration awal.
- Health check semua service.
- `.env.example`, secret handling, dan dokumentasi local setup.

### Sprint 2 — Job dan Application Workflow

- Auth/RBAC minimum.
- CRUD lowongan.
- Upload CV ke private storage.
- `candidate_documents`, `applications`, dan `processing_jobs`.
- Queue + worker baseline.

### Sprint 3 — PDF dan OCR

- Ekstraksi PyMuPDF.
- Kualitas teks dan OCR fallback.
- Parser metadata.
- Error handling serta test PDF digital/scan/rusak.

### Sprint 4 — Structured Extraction

- Pydantic schema.
- Provider abstraction LLM.
- Prompt strict dan validation/retry.
- Normalisasi skill.
- UI review/edit hasil ekstraksi.

### Sprint 5 — Scoring dan Ranking

- Embedding pipeline.
- pgvector.
- Rule-based score breakdown.
- Ranking kandidat per lowongan.
- Dokumentasi formula serta test edge case.

### Sprint 6 — Frontend dan Portfolio Readiness

- Dashboard HR.
- Detail lowongan dan tabel kandidat.
- Detail kandidat + PDF preview.
- Progress processing dan error UX.
- CI/CD, observability, README, screenshots, demo video.

---

## 20. Larangan Kritis

Agent tidak boleh:

1. Menghapus data kandidat, lowongan, atau migration tanpa instruksi eksplisit.
2. Mengubah status kandidat menjadi `rejected` atau `hired` secara otomatis berdasarkan score.
3. Membuat storage CV menjadi public.
4. Menaruh secret dalam file yang dikomit.
5. Menggunakan atribut sensitif untuk ranking.
6. Menghilangkan validation Pydantic/DTO demi shortcut.
7. Menjalankan LLM/OCR sebagai blocking process panjang di HTTP request utama.
8. Mengganti schema/database contract secara diam-diam.
9. Menyimpan log CV mentah atau PII lengkap di production logs.
10. Mengklaim score AI sebagai penilaian objektif atau keputusan final.

---

## 21. Instruksi Respons untuk AI Agent

Saat menerima task, respons agent harus singkat tetapi operasional:

1. Sebutkan pemahaman task dan service yang terdampak.
2. Sebutkan file yang akan diperiksa/diubah.
3. Implementasikan perubahan secara terfokus.
4. Jalankan validasi yang sesuai.
5. Akhiri dengan:
   - Ringkasan perubahan.
   - File yang diubah.
   - Test/perintah yang dijalankan beserta hasilnya.
   - Risiko, asumsi, atau tindak lanjut yang masih diperlukan.

Jika requirement ambigu dan dapat berdampak pada schema, keamanan PII, formula scoring, atau workflow rekrutmen, agent harus meminta klarifikasi sebelum membuat perubahan besar.
