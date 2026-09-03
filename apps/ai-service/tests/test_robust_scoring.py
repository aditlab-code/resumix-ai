import pytest
from app.services.skill_normalizer import (
    match_single_skill,
    evaluate_mandatory_and_preferred_skills,
)
from app.services.experience_calculator import calculate_relevant_experience_months
from app.services.scoring_service import compute_job_fit_score


def test_dynamic_llm_skill_equivalents_matching():
    candidate_skills = {"fastapi", "postgres", "docker compose"}
    skill_equivalents = {
        "Python": ["FastAPI", "Django", "Flask"],
        "PostgreSQL": ["Postgres", "SQL"],
        "Docker": ["Docker Compose", "Podman"]
    }

    # Python should match via FastAPI equivalent
    assert match_single_skill(candidate_skills, "Python", skill_equivalents) is True
    # PostgreSQL should match via Postgres equivalent
    assert match_single_skill(candidate_skills, "PostgreSQL", skill_equivalents) is True
    # Kubernetes should not match
    assert match_single_skill(candidate_skills, "Kubernetes", skill_equivalents) is False


def test_calculate_relevant_experience_months():
    experiences = [
        {"role": "Backend Developer", "company": "Tech Corp", "description": "Python & PostgreSQL API development", "duration_months": 24},
        {"role": "Retail Sales Staff", "company": "Supermarket", "description": "Cashier and customer service", "duration_months": 36},
        {"role": "Software Engineer", "company": "Startup", "description": "Built Docker containers", "duration_months": 12},
    ]

    # Only Tech/Software roles (24 + 12 = 36 months) should be counted as relevant
    rel_months = calculate_relevant_experience_months(
        work_experiences=experiences,
        job_title="Senior Python Engineer",
        mandatory_skills=["Python", "PostgreSQL"]
    )
    assert rel_months == 36


def test_mandatory_skill_strict_penalty_factor():
    # 0 missing skills -> 1.0 penalty factor (100%)
    res_0 = compute_job_fit_score(
        candidate_skills=["Python", "PostgreSQL", "Docker"],
        candidate_experience_months=24,
        mandatory_skills=["Python", "PostgreSQL"],
    )
    assert res_0.mandatory_penalty_factor == 1.0
    assert res_0.final_score > 80.0

    # 1 missing skill -> 0.75 penalty factor (25% discount)
    res_1 = compute_job_fit_score(
        candidate_skills=["Python"],
        candidate_experience_months=24,
        mandatory_skills=["Python", "PostgreSQL", "Docker"],
    )
    assert res_1.mandatory_penalty_factor < 1.0
    assert len(res_1.missing_mandatory_skills) > 0
    # Final score should be reduced by the penalty factor
    assert res_1.final_score < res_0.final_score


def test_taxonomy_synonym_dictionary_matching():
    candidate_skills = {"fastapi", "postgres", "containerization"}

    # Python should match via FastAPI dictionary synonym (without explicit skill_equivalents)
    assert match_single_skill(candidate_skills, "Python") is True
    # PostgreSQL should match via Postgres dictionary synonym
    assert match_single_skill(candidate_skills, "PostgreSQL") is True
    # Docker should match via containerization dictionary synonym
    assert match_single_skill(candidate_skills, "Docker") is True
    # Kubernetes should not match
    assert match_single_skill(candidate_skills, "Kubernetes") is False

