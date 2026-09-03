-- Migration 002: Dual-Vector Embedding Architecture (Skill Vector + Role Vector)

-- Add Dual-Vector Embedding Columns to Candidates Table
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS candidate_skill_embedding vector(384),
ADD COLUMN IF NOT EXISTS candidate_role_embedding vector(384);

-- Add Dual-Vector Embedding Columns to Job Postings Table
ALTER TABLE job_postings
ADD COLUMN IF NOT EXISTS job_skill_embedding vector(384),
ADD COLUMN IF NOT EXISTS job_role_embedding vector(384);

-- Update Function to find top matching candidates based on Dual-Vector Similarity
CREATE OR REPLACE FUNCTION match_candidates_for_job(
    p_job_id UUID,
    p_match_threshold FLOAT DEFAULT 0.4,
    p_match_count INT DEFAULT 20
)
RETURNS TABLE (
    candidate_id UUID,
    full_name VARCHAR,
    email VARCHAR,
    total_experience_months INT,
    skill_similarity FLOAT,
    role_similarity FLOAT,
    semantic_similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS candidate_id,
        c.full_name,
        c.email,
        c.total_experience_months,
        COALESCE((1 - (c.candidate_skill_embedding <=> j.job_skill_embedding))::FLOAT, 0.8) AS skill_similarity,
        COALESCE((1 - (c.candidate_role_embedding <=> j.job_role_embedding))::FLOAT, 0.8) AS role_similarity,
        (
            0.55 * COALESCE((1 - (c.candidate_skill_embedding <=> j.job_skill_embedding))::FLOAT, (1 - (c.profile_embedding <=> j.job_embedding))::FLOAT, 0.8) +
            0.45 * COALESCE((1 - (c.candidate_role_embedding <=> j.job_role_embedding))::FLOAT, (1 - (c.profile_embedding <=> j.job_embedding))::FLOAT, 0.8)
        )::FLOAT AS semantic_similarity
    FROM candidates c
    INNER JOIN job_postings j ON j.id = p_job_id
    WHERE (c.candidate_skill_embedding IS NOT NULL OR c.profile_embedding IS NOT NULL)
      AND (j.job_skill_embedding IS NOT NULL OR j.job_embedding IS NOT NULL)
    ORDER BY (
        0.55 * COALESCE((1 - (c.candidate_skill_embedding <=> j.job_skill_embedding))::FLOAT, (1 - (c.profile_embedding <=> j.job_embedding))::FLOAT, 0.8) +
        0.45 * COALESCE((1 - (c.candidate_role_embedding <=> j.job_role_embedding))::FLOAT, (1 - (c.profile_embedding <=> j.job_embedding))::FLOAT, 0.8)
    ) DESC
    LIMIT p_match_count;
END;
$$;
