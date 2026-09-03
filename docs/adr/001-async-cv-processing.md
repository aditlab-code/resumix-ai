# ADR-001: Asynchronous Worker Processing for CV Ingestion

- **Status**: Approved
- **Deciders**: AI System Architect, Core API Team
- **Date**: 2026-09-03

---

## Context

Proses ekstraksi data CV melibatkan beberapa tahap komputasi berat:
1. Parsing PDF via PyMuPDF.
2. OCR Fallback via Tesseract (dapat memakan waktu 15–45 detik untuk dokumen hasil scan).
3. Pemanggilan LLM provider untuk structured JSON extraction.
4. Generasi vektor embedding via `sentence-transformers`.

Jika proses ini dilakukan secara sinkron dalam handler HTTP `POST /api/v1/jobs/:jobId/applications`, HTTP request akan rentan mengalami **timeout** dan membebani server Node.js.

---

## Decision

Kami memutuskan untuk mengimplementasikan **Asynchronous Queue-Based Processing**:
1. Endpoint `POST /api/v1/jobs/:jobId/applications` bertindak sebagai producer: menyimpan PDF ke Supabase Storage, membuat record aplikasi dengan status `uploaded`, mendorong job ke **Redis / BullMQ**, dan langsung mengembalikan respons `202 Accepted` (< 200ms).
2. Worker process bertindak sebagai consumer: mengambil job dari antrean, memanggil FastAPI AI service, memperbarui database, dan mengubah status aplikasi menjadi `processed`, `needs_review`, atau `failed`.

---

## Consequences

### Positive
- Client UI tidak terhenti (no timeout) saat mengunggah CV panjang/scan.
- Server API tetap responsif melayani request HTTP lainnya.
- Memungkinkan fitur retry otomatis jika LLM provider mengalami rate-limit atau kegagalan sementara.

### Negative
- Membutuhkan infrastruktur Redis Queue dan penanganan worker process tambahan.
- Client UI perlu mengimplementasikan polling atau WebSocket/SSE untuk memantau progres secara real-time.
