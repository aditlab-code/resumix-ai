# Project Overview

> AI-Service Use by Pyhton 3.11 for Build RAG system Pipeline
> Front-end Web use TypeScript Next.js Framework 
> Database use PostGreSQL + PgVector, Queue use Redis, BullMQ

## TODO
1. Read the @AGENTS.md
2. See the Pattern of code, from Context Form input user. 
> IF Clear, Create planning based on code. 
> ! IF NOT CLEAR, ASK BEFORE Execution or EDIT. 
3. EXECUTE 
> DONT don't leave issues or bugs : Orpans, Hardcode, NOT CLEAR?
4. AUDIT EDIT with Independent Agents for Review code
> IF ANY ISSUES based on code writing, MUST BE FIX
5. REPORT to user

## REPORT STATEMENT
1. **Summary of Changes**: What has been implemented/fixed.
2. **List of Changed Files**: Full paths to files that were added/modified.
3. **Verification Results**: Linters/type-checks/tests run and their outcomes.
4. **Risks / Notes**: Assumptions or follow-ups users should be aware of.

## Service Boudaries and Responsibilities
| Service                                  | Stack                            | Tanggung Jawab Utama                                                                                  | Hal yang DILARANG                                                    |
|------------------------------------------|----------------------------------|-------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| **Frontend (`apps/web`)**                | Next.js 14, TypeScript, Tailwind | UI/UX HR, form lowongan, dropzone upload, status tracking, preview PDF, review AI.                    | Secret handling, hitung skor otoritatif, query DB langsung.          |
| **Core API (`apps/api`)**                | Node.js, Express, TypeScript     | Auth/RBAC, CRUD domain, Signed URL, enqueue job ke Redis Queue.                                       | Parsing PDF/OCR/LLM langsung di request handler HTTP sinkron.        |
| **Queue Worker (`apps/api/src/worker`)** | Redis, BullMQ Worker             | Ingestion job asinkron, retry management, panggil AI Service, update status DB.                       | Mengubah status keputusan kandidat secara otomatis.                  |
| **AI Service (`apps/ai-service`)**       | FastAPI, Python 3.11+, Pydantic  | PDF parsing (PyMuPDF), zero-text rejection rule, Groq LLM parsing, normalisasi skill, kalkulasi skor. | Menulis/membaca langsung ke DB utama tanpa melalui kontrak REST API. |
| **Database (`database`)**                | PostgreSQL 15+ + `pgvector`      | Data relasional (12 tabel), similarity vector search (`vector(384)`), audit logs.                     | Menyimpan berkas PDF mentah secara langsung.                         |
| **Storage (`Supabase Storage`)**         | Private Object Storage           | Menyimpan berkas PDF CV secara privat.                                                                | Menjadikan bucket publik tanpa Signed URL sementara.                 |


## MUST RULES

1. MUST TypeScript Next.js Framework For Front-end Website or Python use Pydantic for AI Service
2. MUST Migration Database create new file at `database/migrations/` DONT CHANGE File Migration if commited
3. MUST Semua pemrosesan AI harus via `apps/ai-service`.
4. MUST follow DESIGN.md v2.0 as the Single Source of Truth for all UI component styling, colors, indicator dots, and layout in `apps/web`.

## DO NOT RULES 
1. DO NOT CHANGE File Migration if commited
2. DO NOT ORPHANS CODE
3. DO NOT HARDCODE STYLING, MUST USE COMPONENT GLOBAL
4. DO NOT Claim Skoring AI
5. DO NOT Save any API, password, secret, token didalam code
6. DO NOT use gradients (`bg-gradient-*`), `linear-gradient`, `backdrop-blur`, or glassmorphism in any UI component.
7. DO NOT create un-unified card borders or ad-hoc styling outside DESIGN.md tokens.
