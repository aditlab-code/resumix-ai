from app.schemas.cv_schema import JobFitScoreBreakdown


def compute_job_fit_score(
    candidate_skills: list[str],
    candidate_experience_months: int | None,
    mandatory_skills: list[str],
    preferred_skills: list[str] | None = None,
    required_experience_months: int = 24,
    semantic_similarity: float = 0.80,
) -> JobFitScoreBreakdown:
    """Compute deterministic weighted job-fit score (0-100) and breakdown."""

    # Sanitize list inputs
    skills_list = candidate_skills or []
    mandatory_list = mandatory_skills or []
    preferred_list = preferred_skills or []

    # Clamp semantic similarity to [0.0, 1.0]
    clamped_similarity = max(0.0, min(1.0, float(semantic_similarity or 0.0)))

    # Sanitize experience months
    cand_exp = max(0, candidate_experience_months or 0)
    req_exp = max(0, required_experience_months or 0)

    normalized_candidate_skills = {
        s.lower().strip() for s in skills_list if s and isinstance(s, str)
    }
    normalized_mandatory = [s.strip() for s in mandatory_list if s and isinstance(s, str)]
    normalized_preferred = [s.strip() for s in preferred_list if s and isinstance(s, str)]

    matched_mandatory = [
        s for s in normalized_mandatory if s.lower() in normalized_candidate_skills
    ]
    missing_mandatory = [
        s for s in normalized_mandatory if s.lower() not in normalized_candidate_skills
    ]
    matched_preferred = [
        s for s in normalized_preferred if s.lower() in normalized_candidate_skills
    ]

    mandatory_score = (
        len(matched_mandatory) / len(normalized_mandatory)
        if normalized_mandatory
        else 1.0
    )
    preferred_score = (
        len(matched_preferred) / len(normalized_preferred)
        if normalized_preferred
        else 1.0
    )

    if req_exp <= 0:
        experience_score = 1.0
    else:
        experience_score = min(1.0, cand_exp / req_exp)

    # Weights: 45% semantic, 30% mandatory skills, 20% experience, 5% preferred skills
    w_sem, w_man, w_exp, w_pref = 0.45, 0.30, 0.20, 0.05
    final_score = round(
        100
        * (
            w_sem * clamped_similarity
            + w_man * mandatory_score
            + w_exp * experience_score
            + w_pref * preferred_score
        ),
        1,
    )
    # Ensure final score never falls outside [0.0, 100.0]
    final_score = max(0.0, min(100.0, final_score))

    return JobFitScoreBreakdown(
        score_version="v1",
        semantic_similarity=round(clamped_similarity, 2),
        semantic_weight=w_sem,
        mandatory_skill_score=round(mandatory_score, 2),
        mandatory_skill_weight=w_man,
        experience_score=round(experience_score, 2),
        experience_weight=w_exp,
        preferred_skill_score=round(preferred_score, 2),
        preferred_skill_weight=w_pref,
        final_score=final_score,
        matched_skills=matched_mandatory + matched_preferred,
        missing_mandatory_skills=missing_mandatory,
    )
