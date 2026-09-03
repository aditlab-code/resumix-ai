from typing import Dict, List, Set, Union


def match_single_skill(candidate_skills_lower: Set[str], required_skill: str, skill_equivalents: Dict[str, List[str]] | None = None) -> bool:
    """Check if a required skill or any of its LLM-extracted equivalents match the candidate's normalized skills."""
    if not required_skill or not required_skill.strip():
        return True

    target = required_skill.strip().lower()

    # 1. Exact or Substring Direct Match
    if target in candidate_skills_lower:
        return True

    for c_skill in candidate_skills_lower:
        if target in c_skill or c_skill in target:
            return True

    # 2. Dynamic LLM Equivalents Match
    if skill_equivalents and isinstance(skill_equivalents, dict):
        # Look up key (case-insensitive)
        equivalents_list: List[str] = []
        for req_key, eq_vals in skill_equivalents.items():
            if req_key.strip().lower() == target or target in req_key.strip().lower():
                if isinstance(eq_vals, list):
                    equivalents_list.extend(eq_vals)

        for eq in equivalents_list:
            eq_lower = eq.strip().lower()
            if eq_lower in candidate_skills_lower:
                return True
            for c_skill in candidate_skills_lower:
                if eq_lower in c_skill or c_skill in eq_lower:
                    return True

    return False


def evaluate_mandatory_and_preferred_skills(
    candidate_skills: List[str],
    mandatory_skills: List[str],
    preferred_skills: List[str] | None = None,
    skill_equivalents: Dict[str, List[str]] | None = None,
) -> Dict[str, Union[List[str], float]]:
    """Evaluate matched vs missing mandatory & preferred skills using dynamic LLM taxonomy equivalents across any tech domain."""
    normalized_candidate = {
        s.strip().lower() for s in candidate_skills if s and isinstance(s, str)
    }

    matched_mandatory: List[str] = []
    missing_mandatory: List[str] = []
    matched_preferred: List[str] = []

    clean_mandatory = [s.strip() for s in mandatory_skills if s and isinstance(s, str)]
    clean_preferred = [s.strip() for s in (preferred_skills or []) if s and isinstance(s, str)]

    for req_skill in clean_mandatory:
        if match_single_skill(normalized_candidate, req_skill, skill_equivalents):
            matched_mandatory.append(req_skill)
        else:
            missing_mandatory.append(req_skill)

    for pref_skill in clean_preferred:
        if match_single_skill(normalized_candidate, pref_skill, skill_equivalents):
            matched_preferred.append(pref_skill)

    mandatory_score = (
        len(matched_mandatory) / len(clean_mandatory) if clean_mandatory else 1.0
    )
    preferred_score = (
        len(matched_preferred) / len(clean_preferred) if clean_preferred else 1.0
    )

    return {
        "mandatory_score": round(mandatory_score, 2),
        "preferred_score": round(preferred_score, 2),
        "matched_skills": matched_mandatory + matched_preferred,
        "missing_mandatory_skills": missing_mandatory,
    }
