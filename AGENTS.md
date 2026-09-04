# AGENTS.md

Panduan operasional ringkas (*To The Point*) untuk AI coding agent dan kontributor pada proyek **Resumix AI** (Enterprise Recruitment Intelligence & Next-Gen ATS).

> **PRINSIP UTAMA**: Sistem ini adalah **decision-support tool** untuk HR, bukan mesin penentu keputusan rekrutmen otomatis. **DILARANG** membuat fitur yang secara otomatis menerima (`hired`) atau menolak (`rejected`) kandidat berdasarkan skor AI.

---

## 1. Service Boundaries & Responsibilities

| Service | Stack | Tanggung Jawab Utama | Hal yang DILARANG |
|---|---|---|---|
| **Frontend (`apps/web`)** | Next.js 14, TypeScript, Tailwind | UI/UX HR, form lowongan, dropzone upload, status tracking, preview PDF, review AI. | Secret handling, hitung skor otoritatif, query DB langsung. |
| **Core API (`apps/api`)** | Node.js, Express, TypeScript | Auth/RBAC, CRUD domain, Signed URL, enqueue job ke Redis Queue. | Parsing PDF/OCR/LLM langsung di request handler HTTP sinkron. |
| **Queue Worker (`apps/api/src/worker`)** | Redis, BullMQ Worker | Ingestion job asinkron, retry management, panggil AI Service, update status DB. | Mengubah status keputusan kandidat secara otomatis. |
| **AI Service (`apps/ai-service`)** | FastAPI, Python 3.11+, Pydantic | PDF parsing (PyMuPDF), zero-text rejection rule, Groq LLM parsing, normalisasi skill, kalkulasi skor. | Menulis/membaca langsung ke DB utama tanpa melalui kontrak REST API. |
| **Database (`database`)** | PostgreSQL 15+ + `pgvector` | Data relasional (12 tabel), similarity vector search (`vector(384)`), audit logs. | Menyimpan berkas PDF mentah secara langsung. |
| **Storage (`Supabase Storage`)** | Private Object Storage | Menyimpan berkas PDF CV secara privat. | Menjadikan bucket publik tanpa Signed URL sementara. |

---

## 2. Aturan Kerja Agent (Code & Database Rules)

### Sebelum & Saat Mengubah Kode
1. **TypeScript & Python Strictness**: Gunakan TypeScript strict pada frontend & API (dilarang `any`). Gunakan Pydantic & type hints pada Python AI service.
2. **Database Migrations**: Perubahan DB **WAJIB** membuat migration file baru di `database/migrations/`. Dilarang mengubah file migration yang sudah di-commit.
3. **Non-Blocking Upload**: Upload CV **HARUS** mengembalikan response cepat (`< 200ms`) dengan status `processing_status: queued`. Dilarang membuat client menunggu OCR/LLM/scoring dalam HTTP request sinkron.
4. **Error Handling**: Tampilkan pesan error ramah dalam Bahasa Indonesia di UI/API client. Simpan detail teknis hanya di log internal dengan `request_id`/`job_id`.
5. **No Direct LLM Calls**: Dilarang memanggil LLM provider langsung dari Frontend atau Core API HTTP handler. Semua pemrosesan AI harus via `apps/ai-service`.

### Konvensi Git & Branch
- **Branch**: `feat/<area>-<slug>`, `fix/<area>-<slug>`, `refactor/<area>-<slug>`, `docs/<area>-<slug>`.
- **Commit**: Conventional Commits (e.g., `feat(api): add async upload endpoint`, `fix(ai): fix ocr fallback threshold`).

---

## 3. Status Enums (Domain vs Document)

Jangan mencampur status rekrutmen dengan status pemrosesan dokumen!

- **Rekrutmen (`applications.status`)**: `applied` | `screening` | `interview` | `rejected` | `hired` | `withdrawn`
- **Dokumen (`candidate_documents.parse_status` / `processing_jobs.status`)**: `uploaded` | `queued` | `processing` | `processed` | `needs_review` | `failed`

---

## 4. Pipeline AI & Rules Scoring

1. **Text Extraction & Zero-Text Rejection Rule**:
   - Primary: PyMuPDF (`extract_pdf_text`).
   - Strict Rejection: Tanpa OCR fallback untuk efisiensi resource. Jika PDF tidak memiliki layer teks (`len(raw_text.strip()) == 0`), sistem langsung mengembalikan error HTTP 400 (`NO_TEXT_LAYER`) dan menandai dokumen dengan status `needs_review` untuk tindakan HR.
2. **Groq LLM Extraction (`llama-3.1-8b-instant`)**:
   - Pydantic schema validation. Ekstrak HANYA fakta eksplisit. Gunakan `null` / `[]` jika informasi tidak ada. Dilarang berhalusinasi atau menyimpulkan gender/usia/ras/agama.
3. **Skill Normalizer**:
   - Gunakan kamus sinonim deterministik (`SYNONYM_DICTIONARY`). Dilarang membuat skill baru yang tidak tertulis di CV.
4. **Scoring Engine**:
   - Formula: $\text{Score} = 100 \times (0.45 \cdot S_{\text{sem}} + 0.30 \cdot S_{\text{man}} + 0.20 \cdot S_{\text{exp}} + 0.05 \cdot S_{\text{pref}})$.
   - Skor selalu berada di rentang `0.0` – `100.0` dan harus menyertakan breakdown transparan (`matched_skills`, `missing_mandatory_skills`).

---

## 5. Standard Respon REST API

### Upload Ingestion Success (`POST /api/v1/jobs/:jobId/applications`) -> HTTP 202
```json
{
  "application_id": "uuid",
  "document_id": "uuid",
  "processing_job_id": "uuid",
  "processing_status": "queued",
  "message": "CV berhasil diunggah dan sedang diproses dalam antrean."
}
```

### Standard Error Response
```json
{
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Hanya berkas format PDF yang didukung.",
    "request_id": "uuid"
  }
}
```

---

## 6. Keamanan & PII Guidelines

1. **Private Storage & Signed URLs**: File PDF CV dilarang publik. Berikan akses file ke UI via Temporary Signed URL (TTL maksimum 300 detik).
2. **Redaksi Log PII**: Dilarang menulis teks CV mentah, email, nomor HP, atau signed URL ke console log production.
3. **Secret Protection**: Variable sensitif (`LLM_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`) hanya via `.env` / environment variable. Dilarang menaruh secret dalam git repository.
4. **Fairness**: Dilarang menggunakan foto, usia, gender, etnis, agama, atau status pernikahan dalam perhitungan skor atau embedding.

---

## 7. Larangan Kritis Agent (Absolute NOs)

1. **DILARANG** menghapus data kandidat, lowongan, atau file migration tanpa instruksi eksplisit.
2. **DILARANG** mengubah status aplikasi menjadi `rejected` atau `hired` secara otomatis.
3. **DILARANG** membuat bucket Supabase Storage CV menjadi publik.
4. **DILARANG** menyimpan API key, password, token, atau secret di dalam source code / repository.
5. **DILARANG** menggunakan atribut PII sensitif (foto, gender, usia, agama) untuk ranking/scoring.
6. **DILARANG** menghilangkan validasi DTO/Pydantic demi shortcut.
7. **DILARANG** menjalankan LLM/OCR sebagai blocking process di handler HTTP utama.
8. **DILARANG** mengedit file migration database yang sudah di-commit (buat migration baru).
9. **DILARANG** mencetak log CV mentah atau PII lengkap di console log production.
10. **DILARANG** mengklaim skor AI sebagai keputusan final rekrutmen.

---

## 8. Format Output Respon AI Agent

Saat menyelesaikan tugas, AI Agent harus memberikan respon ringkas dan terstruktur:
1. **Ringkasan Perubahan**: Apa yang telah diimplementasikan/diperbaiki.
2. **Daftar File yang Diubah**: Path lengkap ke file yang ditambahkan/dimodifikasi.
3. **Hasil Verifikasi**: Linter/type-check/test yang dijalankan beserta hasilnya.
4. **Risiko / Catatan**: Asumsi atau tindak lanjut yang perlu diperhatikan pengguna.

---

## 9. Perintah Operasional Server (Start & Terminate)

### Menghentikan Semua Service (*Clean Termination*)
```bash
# Menghentikan port 3000 (Web), 3001 (API), 8000 (AI) & proses node/python/uvicorn
npm run stop

# Atau via bash script otomatis
./scripts/stop-services.sh
```

### Menjalankan Service (Dev Local)
```bash
# 1. Pastikan PostgreSQL & Redis aktif di Docker
docker compose -f docker-compose.dev.yml up -d postgres redis

# 2. Jalankan AI Service, Core API, BullMQ Worker, dan Frontend Web bersamaan
npm run dev:local

# 3. Atau jalankan service individual
npm run dev:ai       # AI Service (Python FastAPI - Port 8000)
npm run dev:api      # Core API (Node.js Express - Port 3001)
npm run dev:worker   # Standalone BullMQ Worker
npm run dev:web      # Frontend Web (Next.js - Port 3000)
```

### Menjalankan via Docker Compose Fullstack
```bash
npm run dev:fullstack   # Atau: docker compose -f docker-compose.dev.yml up
```
