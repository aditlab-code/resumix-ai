# REST API Specification (v1)

Prefix Endpoint: `/api/v1`

---

## 1. Job Postings

### `POST /api/v1/jobs`
Membuat lowongan baru.

**Request Body**:
```json
{
  "title": "Backend Engineer",
  "description": "Dibutuhkan Backend Engineer berpengalaman Python & Node.js",
  "minimum_experience_months": 24,
  "mandatory_skills": ["Python", "PostgreSQL", "Docker"],
  "preferred_skills": ["Redis", "Kubernetes"]
}
```

**Response (201 Created)**:
```json
{
  "job_id": "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
  "status": "open",
  "created_at": "2026-09-03T10:00:00Z"
}
```

---

## 2. Applications & Upload

### `POST /api/v1/jobs/:jobId/applications`
Mengunggah CV PDF untuk lowongan tertentu (Asynchronous Upload).

**Content-Type**: `multipart/form-data`
- `file`: PDF Document (max 10MB)

**Response (202 Accepted)**:
```json
{
  "application_id": "4b7099bb-1e75-4ca1-a243-d2ff1e215c7a",
  "document_id": "6f2b98f0-4f4f-43f6-9432-488942782e7b",
  "processing_job_id": "8a1198f0-4f4f-43f6-9432-488942782e99",
  "processing_status": "queued",
  "message": "CV berhasil diunggah dan sedang diproses dalam antrean."
}
```

---

## 3. Status & Processing Jobs

### `GET /api/v1/processing-jobs/:processingJobId`
Mengecek status pemrosesan asinkron.

**Response (200 OK)**:
```json
{
  "processing_job_id": "8a1198f0-4f4f-43f6-9432-488942782e99",
  "status": "processed",
  "attempt_count": 1,
  "error_message": null,
  "completed_at": "2026-09-03T10:01:15Z"
}
```
