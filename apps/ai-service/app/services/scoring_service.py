from typing import Any, Dict, List
from app.schemas.cv_schema import JobFitScoreBreakdown
from app.services.skill_normalizer import evaluate_mandatory_and_preferred_skills
from app.services.experience_calculator import calculate_relevant_experience_months

# Scoring Weights (must sum to 1.0)
SKILL_SEMANTIC_WEIGHT = 0.25
ROLE_SEMANTIC_WEIGHT = 0.20
MANDATORY_SKILL_WEIGHT = 0.30
EXPERIENCE_WEIGHT = 0.20
PREFERRED_SKILL_WEIGHT = 0.05

# Skill/Role semantic similarity ratio for combined score
SKILL_ROLE_RATIO = 0.55
COMBINED_SEMANTIC_WEIGHT = 0.45

# Mandatory skill penalty factors
HIGH_PENALTY = 0.75  # 1 missing mandatory skill → 25% discount
MEDIUM_PENALTY = 0.50  # 2 missing mandatory skills → 50% discount
LOW_PENALTY = 0.25  # 3+ missing mandatory skills → 75% discount


def compute_job_fit_score(
    candidate_skills: list[str],
    candidate_experience_months: int | None,
    mandatory_skills: list[str],
    preferred_skills: list[str] | None = None,
    required_experience_months: int = 24,
    semantic_similarity: float = 0.0,
    skill_semantic_similarity: float | None = None,
    role_semantic_similarity: float | None = None,
    skill_equivalents: Dict[str, List[str]] | None = None,
    work_experiences: List[Dict[str, Any]] | None = None,
    job_title: str | None = None,
) -> JobFitScoreBreakdown:
    """Compute deterministic weighted job-fit score (0-100) and breakdown using Dual-Vector & Multi-Factor Scoring."""

    # Sanitize list inputs
    skills_list = candidate_skills or []
    mandatory_list = mandatory_skills or []
    preferred_list = preferred_skills or []

    # Clamp semantic similarities to [0.0, 1.0]
    clamped_overall_sim = max(0.0, min(1.0, float(semantic_similarity or 0.0)))
    clamped_skill_sim = max(0.0, min(1.0, float(skill_semantic_similarity if skill_semantic_similarity is not None else clamped_overall_sim)))
    clamped_role_sim = max(0.0, min(1.0, float(role_semantic_similarity if role_semantic_similarity is not None else clamped_overall_sim)))

    # Evaluate Mandatory & Preferred Skills matching with Dynamic LLM Skill Equivalents
    eval_res = evaluate_mandatory_and_preferred_skills(
        candidate_skills=skills_list,
        mandatory_skills=mandatory_list,
        preferred_skills=preferred_list,
        skill_equivalents=skill_equivalents,
    )

    mandatory_score = float(eval_res["mandatory_score"])
    preferred_score = float(eval_res["preferred_score"])
    matched_skills = list(eval_res["matched_skills"])
    missing_mandatory = list(eval_res["missing_mandatory_skills"])

    # Calculate Relevant Domain Experience Months
    if work_experiences and isinstance(work_experiences, list):
        rel_exp_months = calculate_relevant_experience_months(
            work_experiences=work_experiences,
            job_title=job_title,
            mandatory_skills=mandatory_list,
        )
    else:
        rel_exp_months = max(0, candidate_experience_months or 0)

    req_exp = max(0, required_experience_months or 0)
    if req_exp <= 0:
        experience_score = 1.0
    else:
        experience_score = min(1.0, rel_exp_months / req_exp)

    # Mandatory Skill Strict Penalty Factor
    missing_count = len(missing_mandatory)
    if missing_count == 0:
        penalty_factor = 1.0
    elif missing_count == 1:
        penalty_factor = HIGH_PENALTY
    elif missing_count == 2:
        penalty_factor = MEDIUM_PENALTY
    else:
        penalty_factor = LOW_PENALTY

    raw_score = 100 * (
        SKILL_SEMANTIC_WEIGHT * clamped_skill_sim
        + ROLE_SEMANTIC_WEIGHT * clamped_role_sim
        + MANDATORY_SKILL_WEIGHT * mandatory_score
        + EXPERIENCE_WEIGHT * experience_score
        + PREFERRED_SKILL_WEIGHT * preferred_score
    )

    final_score = round(max(0.0, min(100.0, raw_score * penalty_factor)), 1)
    combined_sem_sim = round(SKILL_ROLE_RATIO * clamped_skill_sim + COMBINED_SEMANTIC_WEIGHT * clamped_role_sim, 2)

    return JobFitScoreBreakdown(
        score_version="v2",
        semantic_similarity=combined_sem_sim,
        semantic_weight=0.45,
        skill_semantic_similarity=round(clamped_skill_sim, 2),
        skill_semantic_weight=w_skill_sem,
        role_semantic_similarity=round(clamped_role_sim, 2),
        role_semantic_weight=w_role_sem,
        mandatory_skill_score=round(mandatory_score, 2),
        mandatory_skill_weight=w_man,
        experience_score=round(experience_score, 2),
        experience_weight=w_exp,
        relevant_experience_months=rel_exp_months,
        preferred_skill_score=round(preferred_score, 2),
        preferred_skill_weight=w_pref,
        mandatory_penalty_factor=penalty_factor,
        final_score=final_score,
        matched_skills=matched_skills,
        missing_mandatory_skills=missing_mandatory,
    )
