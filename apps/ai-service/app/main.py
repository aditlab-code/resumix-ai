from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from typing import Any, Dict, List, Optional
from app.schemas.cv_schema import JobFitScoreBreakdown
from app.services.pdf_extractor import extract_pdf_text
from app.services.skill_normalizer import normalize_skill_name
from app.services.scoring_service import compute_job_fit_score
from app.services.llm_provider import function_extract_via_groq
from app.services.embedding_service import (
    DEFAULT_EMBEDDING_MODEL_NAME,
    generate_embedding,
    prepare_candidate_profile_text,
    compute_cosine_similarity,
)

app = FastAPI(
    title="CV ATS AI Microservice",
    description="Microservice for PDF text extraction (PyMuPDF), zero-text rejection rule, structured parsing via Groq (llama-3.1-8b-instant), skill normalization, multilingual embeddings, and job-fit scoring",
    version="1.0.0",
)

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ai-service",
        "provider": "groq",
        "model": "llama-3.1-8b-instant",
        "embedding_model": DEFAULT_EMBEDDING_MODEL_NAME,
    }


@app.post("/v1/cv/extract-text")
async def extract_text_endpoint(file: UploadFile = File(...)):
    is_pdf = (
        file.content_type in ["application/pdf", "application/x-pdf", "application/octet-stream"]
        or (file.filename and file.filename.lower().endswith(".pdf"))
    )
    if not is_pdf:
        raise HTTPException(
            status_code=400, detail="Hanya berkas format PDF yang didukung."
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400, detail=f"Ukuran berkas melebihi batas maksimum {MAX_FILE_SIZE_BYTES // (1024*1024)}MB."
        )

    try:
        raw_text, metadata = extract_pdf_text(file_bytes)
    except ValueError as val_err:
        err_msg = str(val_err)
        if err_msg.startswith("NO_TEXT_LAYER:"):
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "NO_TEXT_LAYER",
                    "message": "Berkas PDF tidak memiliki layer teks yang dapat dibaca. Harap unggah PDF asli berbasis teks.",
                    "parse_status_recommendation": "needs_review"
                }
            )
        raise HTTPException(status_code=400, detail=err_msg)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gagal mengekstrak teks PDF: {str(exc)}")

    return {
        "raw_text": raw_text,
        "metadata": metadata,
    }


@app.post("/v1/cv/llm-extract")
async def llm_extract_endpoint(raw_text: str = Body(..., embed=True)):
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Teks CV tidak boleh kosong.")
    try:
        extraction = await function_extract_via_groq(raw_text)
        return {
            "provider": "groq",
            "model": "llama-3.1-8b-instant",
            "extraction": extraction
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gagal pemrosesan Groq LLM: {str(exc)}")


@app.post("/v1/cv/normalize-skills")
def normalize_skills_endpoint(skills: list[str] = Body(...)):
    normalized = [normalize_skill_name(s) for s in skills]
    return {"skills": skills, "normalized_skills": normalized}


@app.post("/v1/cv/generate-embedding")
def generate_embedding_endpoint(
    text: Optional[str] = Body(default=None),
    cv_extraction: Optional[Dict[str, Any]] = Body(default=None),
):
    """Generate 384-dimensional vector embeddings (overall, skill_embedding, role_embedding) using sentence-transformers."""
    if text and text.strip():
        input_data = text.strip()
    elif cv_extraction:
        input_data = cv_extraction
    else:
        raise HTTPException(status_code=400, detail="Harap sediakan 'text' atau 'cv_extraction'.")

    try:
        target_text = prepare_candidate_profile_text(input_data) if isinstance(input_data, dict) else input_data
        embedding = generate_embedding(target_text)
        from app.services.embedding_service import generate_dual_embeddings
        dual = generate_dual_embeddings(input_data)

        return {
            "model": DEFAULT_EMBEDDING_MODEL_NAME,
            "dimensions": len(embedding),
            "embedding": embedding,
            "skill_embedding": dual["skill_embedding"],
            "role_embedding": dual["role_embedding"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gagal membuat embedding: {str(exc)}")


@app.post("/v1/cv/calculate-score", response_model=JobFitScoreBreakdown)
def calculate_score_endpoint(
    candidate_skills: list[str] = Body(...),
    candidate_experience_months: int | None = Body(default=0),
    mandatory_skills: list[str] = Body(...),
    preferred_skills: list[str] | None = Body(default=None),
    required_experience_months: int = Body(default=24),
    semantic_similarity: float = Body(default=0.80),
    candidate_embedding: Optional[List[float]] = Body(default=None),
    job_embedding: Optional[List[float]] = Body(default=None),
    candidate_skill_embedding: Optional[List[float]] = Body(default=None),
    job_skill_embedding: Optional[List[float]] = Body(default=None),
    candidate_role_embedding: Optional[List[float]] = Body(default=None),
    job_role_embedding: Optional[List[float]] = Body(default=None),
    skill_equivalents: Optional[Dict[str, List[str]]] = Body(default=None),
    work_experiences: Optional[List[Dict[str, Any]]] = Body(default=None),
    job_title: Optional[str] = Body(default=None),
):
    computed_similarity = semantic_similarity
    if candidate_embedding and job_embedding and len(candidate_embedding) == len(job_embedding):
        computed_similarity = compute_cosine_similarity(candidate_embedding, job_embedding)

    skill_sim: float | None = None
    if candidate_skill_embedding and job_skill_embedding and len(candidate_skill_embedding) == len(job_skill_embedding):
        skill_sim = compute_cosine_similarity(candidate_skill_embedding, job_skill_embedding)

    role_sim: float | None = None
    if candidate_role_embedding and job_role_embedding and len(candidate_role_embedding) == len(job_role_embedding):
        role_sim = compute_cosine_similarity(candidate_role_embedding, job_role_embedding)

    return compute_job_fit_score(
        candidate_skills=candidate_skills,
        candidate_experience_months=candidate_experience_months,
        mandatory_skills=mandatory_skills,
        preferred_skills=preferred_skills,
        required_experience_months=required_experience_months,
        semantic_similarity=computed_similarity,
        skill_semantic_similarity=skill_sim,
        role_semantic_similarity=role_sim,
        skill_equivalents=skill_equivalents,
        work_experiences=work_experiences,
        job_title=job_title,
    )


@app.post("/v1/job/extract-qualifications")
async def extract_job_qualifications_endpoint(raw_text: str = Body(..., embed=True)):
    """Parse raw LinkedIn/Glints job text into structured qualifications and generate dual-vector embeddings."""
    if not raw_text or not raw_text.strip():
        raise HTTPException(status_code=400, detail="Teks deskripsi lowongan tidak boleh kosong.")

    try:
        from app.services.job_extractor import extract_job_qualifications_via_groq
        qualifications = await extract_job_qualifications_via_groq(raw_text)

        # Generate 384-dim job_embedding & dual vectors automatically
        job_text_for_embedding = f"Job Title: {qualifications.get('title')}. Experience Required: {qualifications.get('minimum_experience_months')} months. Mandatory Skills: {', '.join(qualifications.get('mandatory_skills', []))}. Summary: {qualifications.get('summary')}"
        job_embedding = generate_embedding(job_text_for_embedding)

        from app.services.embedding_service import generate_dual_embeddings
        dual = generate_dual_embeddings(qualifications)

        return {
            "qualifications": qualifications,
            "job_embedding": job_embedding,
            "job_skill_embedding": dual["skill_embedding"],
            "job_role_embedding": dual["role_embedding"],
            "dimensions": len(job_embedding),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gagal memproses deskripsi lowongan: {str(exc)}")


@app.get("/v1/skills/taxonomies")
def get_skill_taxonomies_endpoint():
    """Retrieve all static and dynamic skill synonym taxonomy mappings."""
    from app.services.skill_normalizer import get_all_taxonomies
    return {"taxonomies": get_all_taxonomies()}


@app.post("/v1/skills/taxonomies")
def register_skill_taxonomy_endpoint(
    canonical_name: str = Body(...),
    synonyms: list[str] = Body(...),
):
    """Register or update custom domain dynamic skill synonyms."""
    if not canonical_name or not canonical_name.strip():
        raise HTTPException(status_code=400, detail="canonical_name tidak boleh kosong.")
    if not isinstance(synonyms, list):
        raise HTTPException(status_code=400, detail="synonyms harus berupa list string.")

    from app.services.skill_normalizer import register_custom_taxonomy, get_all_taxonomies
    register_custom_taxonomy(canonical_name, synonyms)
    return {
        "message": f"Berhasil mendaftarkan sinonim taksonomi untuk '{canonical_name}'",
        "canonical_name": canonical_name,
        "synonyms": synonyms,
        "taxonomies": get_all_taxonomies(),
    }




