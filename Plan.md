## Ringkasan arsitektur yang disarankan

Arsitektur inti tetap sesuai ide Anda, tetapi sebaiknya dipertegas menjadi seperti berikut:

```text
[HR/Admin Web UI]
       |
       v
[Node.js API / BFF]
  |        |         \
  |        |          -> [Supabase Storage: CV asli]
  |        |
  |        -> [PostgreSQL + pgvector]
  |
  v
[Queue / Job Worker]
  |
  v
[FastAPI AI Service]
  |--> PDF text extraction (PyMuPDF)
  |--> OCR fallback (OCRmyPDF/Tesseract)
  |--> LLM structured extraction
  |--> validation + normalization
  |--> embedding generation
  |--> job-fit score
```

Perubahan terpenting: proses unggah dan parsing CV jangan seluruhnya sinkkron dalam request HTTP. Bila LLM/OCR lambat atau gagal, endpoint unggah dapat mengalami timeout. Lebih aman bila Node.js:

1. Menyimpan PDF ke storage.
2. Membuat record `application` berstatus `uploaded` atau `processing`.
3. Mengirim pekerjaan parsing ke queue.
4. Worker memanggil FastAPI.
5. FastAPI mengembalikan ekstraksi, embedding, dan metadata kualitas.
6. Worker menyimpan hasil dan mengubah status menjadi `processed`, `needs_review`, atau `failed`.

Dengan pola ini, HR tetap dapat melihat progres proses CV tanpa menunggu request terbuka terlalu lama. Dokumen awal saat ini masih menggambarkan Node.js menunggu hasil FastAPI secara langsung; itu cocok untuk demo sederhana, tetapi kurang robust untuk CV hasil scan, dokumen panjang, atau beban unggahan banyak. 

## Ruang lingkup MVP

Agar tidak terlalu besar di fase awal, saya sarankan membedakan **MVP**, **versi produksi**, dan **fitur lanjutan**.

| Area         | MVP yang dikerjakan dulu                                 | Tahap lanjutan                                       |
|--------------|----------------------------------------------------------|------------------------------------------------------|
| Upload CV    | PDF maksimal ukuran tertentu, satu CV per aplikasi       | DOCX, multi-file, portfolio, sertifikat              |
| Ekstraksi    | Nama, email, telepon, skills, pendidikan, pengalaman     | Bahasa, sertifikasi, proyek, LinkedIn, lokasi        |
| OCR          | Fallback untuk PDF hasil scan                            | Preprocessing gambar, deskew, multi-language OCR     |
| Lowongan     | CRUD lowongan dan required skills                        | Template job description, approval workflow          |
| Skoring      | Skill overlap + pengalaman minimum + semantic similarity | Explainable ranking, bobot per lowongan, ML ranking  |
| HR Dashboard | Daftar aplikasi, status, skor, detail hasil parsing      | Pipeline Kanban, analytics rekrutmen                 |
| Penyimpanan  | Supabase Storage privat dan signed URL                   | Lifecycle policy, antivirus scanning                 |
| Operasional  | Docker Compose, linting, testing inti                    | Observability, deployment otomatis ke VPS/Kubernetes |

**Definisi selesai MVP** yang realistis:

- HR membuat lowongan.
- Kandidat/HR mengunggah CV PDF.
- Sistem menyimpan CV secara privat.
- Sistem mengekstrak data CV menjadi JSON tervalidasi.
- HR dapat meninjau dan mengoreksi hasil ekstraksi.
- Sistem menghitung skor kecocokan yang dijelaskan komponennya.
- HR dapat menyaring dan mengurutkan kandidat.
- Semua proses memiliki status, log kesalahan, dan kemampuan retry.

Hal yang sangat penting: jangan menjadikan keputusan rekrutmen otomatis sebagai target utama. Sistem harus diposisikan sebagai **decision support** untuk HR, bukan penentu otomatis diterima/ditolak, terutama karena CV mengandung data pribadi dan hasil LLM bisa keliru.

## Rancangan fase pengembangan

### Fase 0 — Fondasi proyek

Sebelum masuk AI engine, siapkan kontrak proyek agar dua layanan tidak berkembang tanpa standar yang sama.

- Monorepo: `apps/api`, `apps/ai-service`, `packages/contracts`, `infra`.
- Definisikan OpenAPI untuk FastAPI dan Node.js.
- Siapkan `.env.example`; jangan pernah memasukkan `GROQ_API_KEY`, Supabase service-role key, maupun SSH key ke Git.
- Tambahkan `docker-compose.dev.yml` untuk pengembangan lokal dan `docker-compose.prod.yml` untuk deployment.
- Tetapkan versi API, misalnya `/api/v1`.
- Buat data sampel CV anonymized untuk testing.
- Buat status proses standar: `uploaded`, `queued`, `processing`, `processed`, `needs_review`, `failed`.

**Deliverable:** proyek dapat berjalan lokal, health-check tersedia, database termigrasi, dan dua service dapat berkomunikasi.

***

### Fase 1 — Ingestion dan ekstraksi teks

Tujuan fase ini bukan langsung LLM, melainkan memastikan semua CV berubah menjadi teks yang cukup baik.

#### Pipeline ekstraksi yang lebih tahan gagal

1. Validasi file:
   - MIME type PDF.
   - Ukuran maksimum, misalnya 5–10 MB untuk MVP.
   - Maksimum jumlah halaman, misalnya 10 halaman.
   - Tolak PDF terenkripsi atau minta pengguna mengunggah versi tanpa password.
2. Simpan file ke private bucket storage.
3. Jalankan ekstraksi teks dengan PyMuPDF.
4. Ukur kualitas hasil ekstraksi, bukan hanya panjang karakter.
5. Jika kualitas buruk, lakukan OCR.
6. Simpan hasil teks mentah, metode ekstraksi, durasi proses, dan confidence/quality metadata.
7. Kirim teks bersih ke LLM.

Kondisi fallback jangan hanya `text.length < 50`. CV dapat memiliki teks lebih dari 50 karakter tetapi rusak, berulang, atau hanya berisi header. Gunakan gabungan indikator:

```python
needs_ocr = (
    len(text.strip()) < 200
    or extracted_word_count < 40
    or readable_character_ratio < 0.65
    or text_has_garbled_patterns(text)
)
```

Tambahkan metadata:

```json
{
  "parser": "pymupdf",
  "ocr_used": false,
  "page_count": 2,
  "extracted_characters": 4218,
  "processing_time_ms": 875,
  "quality_score": 0.92
}
```

Ini berguna untuk debugging dan evaluasi kualitas parser di kemudian hari.

**Deliverable:** endpoint internal FastAPI, misalnya `POST /v1/cv/extract-text`, menerima PDF dan mengembalikan `raw_text + extraction_metadata`.

***

### Fase 2 — Structured extraction dengan LLM

Skema Pydantic pada dokumen awal sudah tepat sebagai awal, tetapi perlu diperluas supaya tidak kehilangan konteks serta bisa menangani data tidak lengkap. 

Contoh skema yang lebih siap produksi:

```python
from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, EmailStr

class ExtractionEvidence(BaseModel):
    source_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class Contact(BaseModel):
    email: EmailStr | None = None
    phone_number: str | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None
    location: str | None = None

class Skill(BaseModel):
    name: str
    normalized_name: str | None = None
    category: Literal[
        "programming_language",
        "framework",
        "database",
        "cloud",
        "tool",
        "soft_skill",
        "other"
    ] = "other"
    evidence: ExtractionEvidence | None = None

class WorkExperience(BaseModel):
    company: str | None = None
    role: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool = False
    duration_months: int | None = Field(default=None, ge=0)
    description: str | None = None
    skills_used: list[str] = Field(default_factory=list)

class Education(BaseModel):
    institution: str | None = None
    degree: str | None = None
    major: str | None = None
    start_year: int | None = None
    end_year: int | None = None

class CVExtraction(BaseModel):
    full_name: str | None = None
    contact: Contact = Field(default_factory=Contact)
    summary: str | None = None
    skills: list[Skill] = Field(default_factory=list)
    work_experience: list[WorkExperience] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    total_experience_months: int | None = Field(default=None, ge=0)
    extraction_warnings: list[str] = Field(default_factory=list)
```

### Prinsip prompt

Prompt harus membedakan dengan jelas antara:

- Data yang **tertulis eksplisit**.
- Data yang **tidak dapat dipastikan**.
- Normalisasi yang diperbolehkan, misalnya `ReactJS` menjadi `React`.
- Inferensi yang tidak diperbolehkan, misalnya seseorang memakai Next.js lalu dianggap pasti ahli React tingkat senior.

Contoh instruksi inti:

```text
Anda adalah mesin ekstraksi data CV untuk ATS.

Aturan wajib:
1. Ekstrak hanya fakta yang tertulis eksplisit pada CV.
2. Jangan menyimpulkan kemampuan, senioritas, lokasi, atau pengalaman yang tidak tertulis.
3. Bila informasi tidak ditemukan, gunakan null untuk objek/scalar dan [] untuk daftar.
4. Jangan menambahkan properti JSON di luar skema.
5. Pertahankan bukti teks singkat bila tersedia.
6. Durasi kerja dihitung dari tanggal yang eksplisit.
7. Jika tanggal tidak lengkap atau ambigu, isi duration_months sebagai null dan tambahkan peringatan.
8. Keluarkan JSON valid yang mematuhi schema, tanpa markdown dan tanpa narasi.
```

### Validasi berlapis

Jangan mempercayai output LLM hanya karena API menawarkan structured output. Terapkan:

1. Validasi JSON parse.
2. Validasi Pydantic.
3. Normalisasi skill.
4. Validasi email dan nomor telepon.
5. Deduplicasi pengalaman kerja.
6. Pemeriksaan nilai anomali, misalnya `duration_months > 600`.
7. Retry terbatas bila respons tidak valid.
8. Tandai `needs_review` bila hasil terlalu kosong atau banyak warning.

**Deliverable:** endpoint `POST /v1/cv/extract-structured`, output JSON tervalidasi, lengkap dengan `warnings`, `model_version`, dan `processing_metadata`.

## Data model dan API

Struktur tiga tabel pada dokumen Anda—`candidates`, `job_postings`, dan `applications`—benar secara konsep. Namun, untuk sistem yang dapat diaudit dan dikembangkan, beberapa entitas perlu dipisah. 

### ERD konseptual

```text
users
  └── job_postings
         └── applications ─── candidates
                                ├── candidate_skills
                                ├── candidate_experiences
                                ├── candidate_educations
                                └── candidate_documents
```

### Tabel inti yang disarankan

| Tabel                   | Fungsi                             | Kolom penting                                                                                                                        |
|-------------------------|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `candidates`            | Identitas master kandidat          | `id`, `full_name`, `email`, `phone_number`, `total_experience_months`, `profile_embedding`, `parsed_cv_json`, timestamps             |
| `candidate_documents`   | Riwayat tiap CV yang diunggah      | `id`, `candidate_id`, `storage_path`, `file_hash`, `original_filename`, `parse_status`, `parser_metadata`, `raw_text`, `uploaded_at` |
| `candidate_skills`      | Skill kandidat yang mudah difilter | `id`, `candidate_id`, `skill_name`, `normalized_skill`, `category`, `source_document_id`                                             |
| `candidate_experiences` | Pengalaman kerja ternormalisasi    | `id`, `candidate_id`, `company`, `role`, `start_date`, `end_date`, `duration_months`, `description`                                  |
| `candidate_educations`  | Pendidikan kandidat                | `id`, `candidate_id`, `institution`, `degree`, `major`, `start_year`, `end_year`                                                     |
| `job_postings`          | Lowongan kerja                     | `id`, `title`, `description`, `minimum_experience_months`, `job_embedding`, `status`, `created_by`                                   |
| `job_required_skills`   | Skill persyaratan per lowongan     | `id`, `job_id`, `skill_name`, `normalized_skill`, `is_mandatory`, `weight`                                                           |
| `applications`          | Relasi kandidat-lowongan           | `id`, `candidate_id`, `job_id`, `document_id`, `status`, `job_fit_score`, `score_breakdown`, `applied_at`                            |
| `processing_jobs`       | Audit proses AI                    | `id`, `document_id`, `job_type`, `status`, `attempt_count`, `error_message`, timestamps                                              |
| `score_versions`        | Versi formula ranking              | `id`, `name`, `formula_version`, `configuration_json`, `active`                                                                      |

### Catatan desain penting

- Gunakan `JSONB` untuk snapshot hasil LLM (`parsed_cv_json`), tetapi jangan menjadikannya satu-satunya sumber data operasional.
- Simpan skill dan pengalaman pada tabel terpisah agar mudah dilakukan filtering SQL, analitik, dan audit.
- Gunakan `storage_path`, bukan URL publik permanen. Buat signed URL saat HR ingin membuka CV.
- Jangan hanya menjadikan email sebagai identitas mutlak. Banyak CV tidak menulis email, dan alamat email juga dapat berubah. Gunakan UUID internal serta strategi deduplikasi.
- Tambahkan `file_hash` untuk mendeteksi PDF yang sama diunggah ulang.
- Simpan `score_breakdown` agar HR memahami alasan skor, bukan hanya melihat angka tunggal.

Contoh `score_breakdown`:

```json
{
  "semantic_similarity": 0.82,
  "semantic_weight": 0.45,
  "mandatory_skill_score": 0.75,
  "mandatory_skill_weight": 0.30,
  "experience_score": 1.00,
  "experience_weight": 0.20,
  "preferred_skill_score": 0.60,
  "preferred_skill_weight": 0.05,
  "final_score": 84.4,
  "matched_skills": ["Python", "PostgreSQL", "Docker"],
  "missing_mandatory_skills": ["Kubernetes"]
}
```

### Endpoint API minimal

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
PATCH  /api/v1/candidates/:candidateId

GET    /api/v1/jobs/:jobId/rankings
GET    /api/v1/processing-jobs/:processingJobId
```

Untuk upload, gunakan `multipart/form-data`. Respons awal sebaiknya langsung mengembalikan status proses, bukan memaksa klien menunggu seluruh ekstraksi:

```json
{
  "application_id": "4b7099bb-1e75-4ca1-a243-d2ff1e215c7a",
  "document_id": "6f2b98f0-4f4f-43f6-9432-488942782e7b",
  "processing_status": "queued",
  "message": "CV berhasil diunggah dan sedang diproses."
}
```

## Strategi job-fit scoring

Formula dokumen awal, yaitu semantic similarity 70% dan pengalaman 30%, cukup sebagai eksperimen awal. Akan tetapi, untuk ATS lebih baik memisahkan **syarat wajib** dari sinyal ranking agar kandidat yang tidak memiliki kompetensi wajib tidak menang hanya karena teks CV mirip. 

Formula MVP yang lebih mudah dijelaskan:

\[
S = 100 \times \left(
0.45S_{semantic} +
0.30S_{mandatory} +
0.20S_{experience} +
0.05S_{preferred}
\right)
\]

Dengan:

- \(S_{semantic}\): cosine similarity antara profil kandidat dan lowongan, dinormalisasi ke rentang 0–1.
- \(S_{mandatory}\): proporsi skill wajib yang benar-benar ditemukan pada kandidat.
- \(S_{experience}\): rasio pengalaman kandidat terhadap pengalaman minimal, dibatasi maksimal 1.
- \(S_{preferred}\): kecocokan skill tambahan/non-wajib.

Untuk pengalaman:

\[
S_{experience} = \min\left(1,\frac{M_{candidate}}{M_{minimum}}\right)
\]

Contoh:

- Lowongan Backend Engineer membutuhkan Python, PostgreSQL, Docker sebagai skill wajib dan minimal 24 bulan pengalaman.
- Kandidat memiliki Python dan PostgreSQL, tidak memiliki Docker, serta pengalaman 36 bulan.
- `mandatory_skill_score = 2/3 = 0.667`.
- `experience_score = min(1, 36/24) = 1`.
- Misalkan semantic score 0.80 dan preferred score 0.50.

\[
S = 100 \times ((0.45)(0.80) + (0.30)(0.667) + (0.20)(1) + (0.05)(0.50))
\]

\[
S \approx 78.5
\]

Namun sistem tidak boleh hanya menampilkan “78.5%”. Tampilkan alasan:

- Cocok: Python, PostgreSQL.
- Belum ditemukan: Docker.
- Pengalaman: 36 bulan, memenuhi minimum 24 bulan.
- Kemiripan semantik: tinggi.

### Normalisasi skill

Sebelum embedding maupun pencocokan eksplisit, gunakan kamus normalisasi:

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

Catatan penting: kamus ini jangan dipakai untuk mengubah fakta CV secara agresif. Fungsinya untuk pencocokan internal, sedangkan nilai asli tetap disimpan.

### pgvector

Simpan embedding untuk pencarian kandidat dalam skala besar, misalnya:

```sql
SELECT
  c.id,
  c.full_name,
  1 - (c.profile_embedding <=> j.job_embedding) AS semantic_similarity
FROM candidates c
JOIN job_postings j ON j.id = :job_id
WHERE j.status = 'open'
ORDER BY c.profile_embedding <=> j.job_embedding
LIMIT 20;
```

Gunakan embedding terutama untuk **candidate discovery** dan ranking awal. Setelah kandidat ditemukan, hitung kembali skor gabungan lengkap dengan skill wajib dan pengalaman agar hasilnya tetap dapat dijelaskan.

## Keamanan dan tata kelola

CV adalah data pribadi: nama, kontak, riwayat pendidikan, pengalaman, kadang alamat, foto, bahkan nomor identitas. Karena itu, bagian keamanan seharusnya menjadi fase eksplisit, bukan tambahan akhir.

- Storage bucket harus privat; akses file menggunakan signed URL dengan masa berlaku singkat.
- Terapkan Role-Based Access Control: `admin`, `hr_recruiter`, `hiring_manager`, `viewer`.
- Gunakan Row Level Security bila memakai Supabase.
- Jangan kirim file CV mentah ke LLM bila cukup mengirim teks hasil ekstraksi yang telah diminimalkan.
- Redaksi atau jangan gunakan atribut sensitif dalam scoring: foto, jenis kelamin, usia, agama, status perkawinan, alamat detail, suku/etnis, dan informasi kesehatan.
- Catat audit log: siapa membuka CV, mengubah status kandidat, memperbarui lowongan, atau melakukan reprocess.
- Tetapkan retensi data, misalnya CV dihapus/anonymized setelah periode tertentu jika kandidat tidak direkrut.
- Sediakan mekanisme penghapusan data kandidat.
- Lindungi endpoint upload dari malware, file spoofing, oversized upload, dan PDF bomb.
- Terapkan rate limit, validasi JWT, CORS ketat, dan secret management.
- Jangan log `raw_text` CV penuh di production log maupun platform observability.

## Roadmap sprint

Berikut planning 6 sprint, masing-masing 1 minggu atau disesuaikan dengan waktu Anda.

| Sprint | Target                     | Output terukur                                                                  |
|--------|----------------------------|---------------------------------------------------------------------------------|
| 1      | Project foundation         | Monorepo, Docker Compose, PostgreSQL/Supabase, migration, health-check, linting |
| 2      | Job & application workflow | CRUD lowongan, upload CV privat, record aplikasi, status processing             |
| 3      | PDF/OCR pipeline           | PyMuPDF, OCR fallback, metadata parsing, test corpus CV                         |
| 4      | LLM structured extraction  | Pydantic schema, prompt, retry, normalisasi, halaman review hasil ekstraksi     |
| 5      | Scoring & ranking          | Embedding, pgvector, skill matching, experience rule, score breakdown           |
| 6      | Production readiness       | CI/CD, tests, monitoring, README, diagram Mermaid, demo video                   |

### Kriteria penerimaan per modul

**Parsing CV**
- PDF digital dapat diekstrak.
- PDF hasil scan menjalankan OCR fallback.
- Gagal parsing menghasilkan status `failed`, error yang aman, dan dapat di-retry.
- Tidak ada file CV yang hilang walaupun parsing gagal.

**Ekstraksi LLM**
- Output mematuhi schema.
- Data kosong tidak dihalusinasi.
- Validasi gagal menjalankan retry maksimal yang dibatasi.
- Hasil ber-warning masuk antrean review HR.

**Scoring**
- Nilai selalu 0–100.
- Skor memiliki breakdown.
- Skill wajib yang tidak terpenuhi terlihat jelas.
- Perubahan formula dapat dilacak berdasarkan versi.

**Deployment**
- `docker compose up` menjalankan semua service.
- CI menjalankan linter dan test.
- Secret tidak masuk repository.
- Dokumentasi memungkinkan orang lain menjalankan proyek secara lokal.

## Struktur repository

```text
cv-ats-pipeline/
├── apps/
│   ├── api/                         # Node.js / Express atau NestJS
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── jobs/
│   │   │   │   ├── candidates/
│   │   │   │   ├── applications/
│   │   │   │   └── processing/
│   │   │   ├── services/
│   │   │   └── middleware/
│   │   ├── tests/
│   │   └── Dockerfile
│   └── ai-service/                  # FastAPI
│       ├── app/
│       │   ├── api/
│       │   ├── schemas/
│       │   ├── services/
│       │   │   ├── pdf_extractor.py
│       │   │   ├── ocr_service.py
│       │   │   ├── llm_extractor.py
│       │   │   ├── embedding_service.py
│       │   │   └── skill_normalizer.py
│       │   └── tests/
│       ├── requirements.txt
│       └── Dockerfile
├── packages/
│   └── contracts/                   # OpenAPI/JSON schema/shared DTO
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── functions/
├── infra/
│   ├── docker/
│   └── nginx/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── scoring.md
│   ├── security.md
│   └── evaluation.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## Evaluasi kualitas AI

Bagian ini sangat penting bila proyek akan dipakai sebagai portofolio AI atau bahan riset tesis. Jangan hanya mendemokan bahwa sistem “bisa mengeluarkan JSON”; ukur kualitasnya.

Siapkan dataset evaluasi kecil yang dianonimkan, misalnya 30–100 CV dengan ground truth manual.

Metrik yang bisa digunakan:

- **Field accuracy** untuk nama, email, nomor telepon.
- **Precision, recall, F1-score** untuk daftar skill.
- **Date extraction accuracy** untuk rentang pengalaman.
- **JSON validity rate** untuk memastikan structured output benar.
- **OCR fallback rate** untuk melihat proporsi CV scan.
- **Average processing time** per CV.
- **Manual correction rate** oleh HR.
- **Ranking agreement**, yaitu seberapa dekat top-k hasil sistem dibandingkan ranking HR.

Contoh target MVP:

| Metrik                             | Target awal |
|------------------------------------|------------:|
| JSON valid setelah validasi/retry  |       ≥ 98% |
| Akurasi email                      |       ≥ 98% |
| F1 ekstraksi skill                 |      ≥ 0.80 |
| Pemrosesan PDF digital             |  < 10 detik |
| Pemrosesan PDF scan                |  < 45 detik |
| Koreksi manual field utama         |       < 20% |
| Kegagalan tanpa status error jelas |          0% |

## Prioritas keputusan teknis

Agar planning tidak tertahan terlalu lama, berikut keputusan yang sebaiknya segera dikunci:

1. **Storage:** pilih Supabase Storage untuk MVP karena integrasinya dekat dengan PostgreSQL dan autentikasi.
2. **Database:** PostgreSQL Supabase dengan pgvector sejak awal, tetapi indeks vector bisa ditunda sampai data cukup banyak.
3. **Queue:** Redis + BullMQ di Node.js adalah pilihan natural bila backend Anda Express; alternatif ringan awal adalah tabel `processing_jobs` dengan worker polling.
4. **OCR:** gunakan Tesseract sebagai baseline lokal; pastikan Docker image memuat dependency sistemnya.
5. **LLM:** abstraksikan provider melalui interface agar Groq dapat diganti tanpa mengubah domain logic.
6. **Embedding:** model multilingual lebih relevan bila CV dan lowongan berbahasa Indonesia maupun Inggris. Jangan langsung mengunci MiniLM bahasa Inggris saja tanpa pengujian corpus Anda.
7. **Frontend:** jangan menjadi fokus fase pertama. Cukup dashboard HR sederhana setelah alur backend stabil.
8. **Human-in-the-loop:** hasil parsing harus dapat diperbaiki HR; hasil koreksi dapat menjadi dataset evaluasi atau fine-tuning di masa depan.

## Perbaikan pada dokumen awal

Beberapa istilah dan detail pada file perlu dirapikan agar terlihat profesional:

- `MyMuPDF` → **PyMuPDF**.
- `PostgreeSQL` → **PostgreSQL**.
- `Embbeding` → **Embedding**.
- `Text Aray` → **Text Array**.
- `Valchar` → **Varchar**.
- `Total_experience_monts` → **total_experience_months**.
- `Candidadate_id` → **candidate_id**.
- `Status enun` → **Status enum**.
- `many-to-any` → untuk `applications`, istilah yang tepat adalah **many-to-many relationship** antara kandidat dan lowongan.
- Penyimpanan embedding sebaiknya mendefinisikan tipe secara eksplisit, misalnya `vector(384)` bila model memang menghasilkan 384 dimensi.
- `cv_file_url` lebih aman diganti menjadi `cv_storage_path`; URL bertanda tangan dibuat saat file akan diakses.