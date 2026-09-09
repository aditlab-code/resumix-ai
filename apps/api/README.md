# Resumix AI Core API & Queue Worker (`apps/api`)

Node.js Express REST API server and Redis BullMQ worker engine for auth/RBAC, recruitment domain CRUD, temporary signed URL generation, asynchronous ingestion job orchestration, and database persistence.

---

## Service Boundaries & Architecture

- **Core API Server (Port 3000 / 3001)**: Handles HTTP REST endpoints `/api/v1`, candidate document ingestion uploads (instant `HTTP 202 Accepted` response in `< 200ms`), signed storage URL generation, and job posting CRUD.
- **BullMQ Async Worker (`apps/api/src/worker`)**: Consumes queued PDF processing tasks from Redis, orchestrates AI microservice pipeline calls, persists extracted candidate data & 384-dimensional vector embeddings to PostgreSQL (`pgvector`), and updates processing job status.

---

## Key Core API Endpoints

- `GET /health` — Service health check & AI service connectivity status.
- `GET /api/v1/jobs` — Retrieve job postings and qualification requirements.
- `POST /api/v1/jobs` — Create job postings and trigger automatic dual-vector job embedding generation.
- `POST /api/v1/jobs/import-linkedin` — Import & parse job description text via AI Service.
- `POST /api/v1/jobs/:jobId/applications` — Asynchronous candidate CV upload & queue ingestion.
- `POST /api/v1/jobs/:jobId/evaluate-instant` — Synchronous real-time candidate evaluation.
- `GET /api/v1/jobs/:jobId/candidates/match` — Vector similarity match query via `pgvector` HNSW index.
- `PATCH /api/v1/applications/:applicationId/status` — Recruitment pipeline status transition.

---

## Environment & Run Scripts

```bash
# Development server (Port 3001)
npm run dev

# Production build
npm run build
npm start
```
