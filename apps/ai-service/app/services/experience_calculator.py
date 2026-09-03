from typing import Any, Dict, List


def calculate_relevant_experience_months(
    work_experiences: List[Dict[str, Any]],
    job_title: str | None = None,
    mandatory_skills: List[str] | None = None,
) -> int:
    """Calculate the sum of work experience durations (in months) for roles relevant to the target job domain/skills.
    Filters out non-relevant work experience entries (e.g. non-tech/unrelated roles).
    """
    if not work_experiences or not isinstance(work_experiences, list):
        return 0

    clean_job_title = (job_title or "").strip().lower()
    clean_mandatory = [s.strip().lower() for s in (mandatory_skills or []) if s and isinstance(s, str)]

    # Keywords from job title & skills
    title_words = [w for w in clean_job_title.split() if len(w) > 2]
    keywords = set(title_words + clean_mandatory)

    total_relevant_months = 0

    for exp in work_experiences:
        if not isinstance(exp, dict):
            continue

        role = (exp.get("role") or "").strip().lower()
        desc = (exp.get("description") or "").strip().lower()
        company = (exp.get("company") or "").strip().lower()
        duration = max(0, exp.get("duration_months") or 0)

        # If job title or skills not specified, include experience by default
        if not keywords:
            total_relevant_months += duration
            continue

        # Check if role title or description matches any keyword
        is_relevant = False
        full_exp_text = f"{role} {desc} {company}"

        for kw in keywords:
            if kw in full_exp_text:
                is_relevant = True
                break

        # Check common tech role terms
        tech_role_terms = ["engineer", "developer", "programmer", "specialist", "analyst", "architect", "lead", "manager", "admin", "tech"]
        if not is_relevant and any(term in role for term in tech_role_terms):
            is_relevant = True

        if is_relevant:
            total_relevant_months += duration

    return total_relevant_months
