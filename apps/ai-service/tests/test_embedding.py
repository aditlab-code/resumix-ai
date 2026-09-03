import pytest
from app.services.embedding_service import (
    generate_embedding,
    prepare_candidate_profile_text,
    compute_cosine_similarity,
)


def test_generate_embedding_dimensions():
    text = "Pengembang Web Fullstack berpengalaman 3 tahun."
    embedding = generate_embedding(text)

    assert isinstance(embedding, list)
    assert len(embedding) == 384
    assert any(val != 0.0 for val in embedding)


def test_empty_text_embedding():
    embedding = generate_embedding("")
    assert len(embedding) == 384
    assert all(val == 0.0 for val in embedding)


def test_prepare_candidate_profile_text():
    cv_dict = {
        "full_name": "Budi Santoso",
        "summary": "Software Engineer berpengalaman di bidang web development.",
        "skills": [
            {"name": "Python", "normalized_name": "Python"},
            {"name": "PostgreSQL", "normalized_name": "PostgreSQL"},
        ],
        "work_experience": [
            {
                "role": "Backend Engineer",
                "company": "PT Tech Indonesia",
                "description": "Mengembangkan API microservices.",
            }
        ],
        "education": [
            {
                "degree": "S1",
                "major": "Teknik Informatika",
                "institution": "Universitas Indonesia",
            }
        ],
    }

    formatted_text = prepare_candidate_profile_text(cv_dict)
    assert "Budi Santoso" in formatted_text
    assert "Python" in formatted_text
    assert "Backend Engineer" in formatted_text
    assert "Teknik Informatika" in formatted_text


def test_multilingual_similarity_cross_lingual():
    text_id = "Pengembang Backend Python dengan pengalaman PostgreSQL dan Docker."
    text_en = "Python Backend Engineer experienced in PostgreSQL and Docker infrastructure."
    unrelated_id = "Spesialis Akuntansi Keuangan dan Perpajakan Indonesia."

    emb_id = generate_embedding(text_id)
    emb_en = generate_embedding(text_en)
    emb_unrelated = generate_embedding(unrelated_id)

    sim_cross_lingual = compute_cosine_similarity(emb_id, emb_en)
    sim_unrelated = compute_cosine_similarity(emb_id, emb_unrelated)

    # Cross-lingual (ID vs EN) should have high similarity (> 0.70)
    assert sim_cross_lingual > 0.70

    # Unrelated job should have significantly lower similarity (< 0.45)
    assert sim_unrelated < 0.45
    assert sim_cross_lingual > sim_unrelated
