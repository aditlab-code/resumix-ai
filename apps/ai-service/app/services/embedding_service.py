import os
import math
from typing import Any, Dict, List, Union
from sentence_transformers import SentenceTransformer

DEFAULT_EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

DEFAULT_MODEL_CACHE_DIR = os.getenv(
    "MODEL_CACHE_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))
)

_model_instance: SentenceTransformer | None = None


def get_embedding_model(model_name: str | None = None, cache_dir: str | None = None) -> SentenceTransformer:
    """Singleton getter for the SentenceTransformer model to prevent repeated loading overhead."""
    global _model_instance
    name = model_name or DEFAULT_EMBEDDING_MODEL_NAME
    folder = cache_dir or DEFAULT_MODEL_CACHE_DIR

    if _model_instance is None:
        _model_instance = SentenceTransformer(name, cache_folder=folder)
    return _model_instance


def generate_embedding(text: str, model_name: str | None = None) -> List[float]:
    """Generate a normalized 384-dimensional float vector embedding for input text.
    Handles empty text gracefully by returning a zero vector of dimension 384.
    """
    if not text or not text.strip():
        return [0.0] * 384

    model = get_embedding_model(model_name)
    embedding = model.encode(text.strip(), convert_to_numpy=True, normalize_embeddings=True)
    return embedding.tolist()


def prepare_candidate_profile_text(cv_input: Union[Dict[str, Any], str]) -> str:
    """Format candidate extraction JSON into a dense, structured textual representation
    optimized for multilingual embedding models (Indonesian & English).
    """
    if isinstance(cv_input, str):
        return cv_input.strip()

    if not isinstance(cv_input, dict):
        return ""

    parts = []

    # Full Name / Contact / Executive Summary
    full_name = cv_input.get("full_name") or ""
    summary = cv_input.get("summary") or ""
    contact = cv_input.get("contact") or {}
    email = contact.get("email") if isinstance(contact, dict) else ""
    phone = contact.get("phone_number") if isinstance(contact, dict) else ""
    location = contact.get("location") if isinstance(contact, dict) else ""

    contact_str = " | ".join(filter(None, [email, phone, location]))
    if full_name or summary or contact_str:
        parts.append(f"Candidate Profile: {full_name} ({contact_str}). {summary}".strip())


    # Skills
    skills = cv_input.get("skills") or []
    skill_names = []
    for s in skills:
        if isinstance(s, dict):
            name = s.get("normalized_name") or s.get("name")
        elif isinstance(s, str):
            name = s
        else:
            name = None
        if name:
            skill_names.append(name)
    if skill_names:
        parts.append("Technical Skills: " + ", ".join(skill_names))

    # Work Experiences
    experiences = cv_input.get("work_experience") or []
    exp_strings = []
    for exp in experiences:
        if isinstance(exp, dict):
            role = exp.get("role") or ""
            company = exp.get("company") or ""
            desc = exp.get("description") or ""
            exp_str = f"{role} at {company}. {desc}".strip()
            if exp_str:
                exp_strings.append(exp_str)
    if exp_strings:
        parts.append("Work Experience: " + " | ".join(exp_strings))

    # Education
    educations = cv_input.get("education") or []
    edu_strings = []
    for edu in educations:
        if isinstance(edu, dict):
            degree = edu.get("degree") or ""
            major = edu.get("major") or ""
            inst = edu.get("institution") or ""
            edu_str = f"{degree} {major} from {inst}".strip()
            if edu_str:
                edu_strings.append(edu_str)
    if edu_strings:
        parts.append("Education: " + " | ".join(edu_strings))

    return "\n".join(parts)


def prepare_skills_text(cv_or_job_input: Union[Dict[str, Any], List[str], str]) -> str:
    """Prepare a focused text string containing technical skills and competencies for skill embedding generation."""
    if isinstance(cv_or_job_input, str):
        return f"Technical Skills: {cv_or_job_input.strip()}"

    if isinstance(cv_or_job_input, list):
        return "Technical Skills: " + ", ".join([str(s) for s in cv_or_job_input if s])

    if isinstance(cv_or_job_input, dict):
        # Candidate CV case
        skills = cv_or_job_input.get("skills") or cv_or_job_input.get("mandatory_skills") or []
        skill_names = []
        for s in skills:
            if isinstance(s, dict):
                name = s.get("normalized_name") or s.get("name")
            elif isinstance(s, str):
                name = s
            else:
                name = None
            if name:
                skill_names.append(name)
        
        pref_skills = cv_or_job_input.get("preferred_skills") or []
        for s in pref_skills:
            if isinstance(s, str) and s not in skill_names:
                skill_names.append(s)

        if skill_names:
            return "Technical Skills: " + ", ".join(skill_names)

    return "Technical Skills: General Engineering"


def prepare_role_text(cv_or_job_input: Union[Dict[str, Any], str]) -> str:
    """Prepare a focused text string containing role responsibilities and executive summaries for role embedding generation."""
    if isinstance(cv_or_job_input, str):
        return f"Role Description: {cv_or_job_input.strip()}"

    if isinstance(cv_or_job_input, dict):
        parts = []
        title = cv_or_job_input.get("title") or cv_or_job_input.get("full_name") or ""
        summary = cv_or_job_input.get("summary") or ""
        if title or summary:
            parts.append(f"Role Summary ({title}): {summary}".strip())

        experiences = cv_or_job_input.get("work_experience") or []
        exp_strings = []
        for exp in experiences:
            if isinstance(exp, dict):
                role = exp.get("role") or ""
                company = exp.get("company") or ""
                desc = exp.get("description") or ""
                exp_str = f"{role} at {company}. {desc}".strip()
                if exp_str:
                    exp_strings.append(exp_str)
        if exp_strings:
            parts.append("Key Responsibilities: " + " | ".join(exp_strings))

        if parts:
            return "\n".join(parts)

    return "Role Description: General Professional Role"


def generate_dual_embeddings(cv_or_job_input: Union[Dict[str, Any], str]) -> Dict[str, List[float]]:
    """Generate both skill_embedding and role_embedding (384-dimensional vectors)."""
    skills_text = prepare_skills_text(cv_or_job_input)
    role_text = prepare_role_text(cv_or_job_input)

    skill_vec = generate_embedding(skills_text)
    role_vec = generate_embedding(role_text)

    return {
        "skill_embedding": skill_vec,
        "role_embedding": role_vec,
    }


def compute_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two float vectors.
    Returns similarity score clamped in range [0.0, 1.0].
    """
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = math.sqrt(sum(a * a for a in vec1))
    norm_b = math.sqrt(sum(b * b for b in vec2))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    similarity = dot_product / (norm_a * norm_b)
    return max(0.0, min(1.0, float(similarity)))

