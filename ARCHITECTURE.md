# Architecture Overview

Dokumen lengkap arsitektur sistem **CV ATS Pipeline** berlokasi di [docs/architecture.md](file:///home/aditlinux/Dokumen/GitFolder/Architecture-RAG-pipeline/docs/architecture.md).

## Ringkasan Singkat

1. **Frontend (`apps/web`)**: Next.js (TypeScript) + Tailwind CSS + TanStack Query.
2. **Core API (`apps/api`)**: Node.js + Express (Orkestrasi Auth, CRUD, Signed URL, dan Redis BullMQ Worker Queue).
3. **AI Service (`apps/ai-service`)**: Python + FastAPI (PyMuPDF, Tesseract OCR fallback, Pydantic structured extraction, Sentence-Transformers embedding, & Scoring Engine).
4. **Database (`database/`)**: PostgreSQL + `pgvector` extension dengan 12 tabel ter-normalisasi.
5. **Storage**: Private object storage (Supabase Storage) dengan akses file via Short-Lived Signed URLs.

Untuk spesifikasi detail service boundary, alur data asinkron, diagram Mermaid, dan kebijakan PII, silakan baca [docs/architecture.md](file:///home/aditlinux/Dokumen/GitFolder/Architecture-RAG-pipeline/docs/architecture.md).
