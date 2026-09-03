-- Function to find top matching candidates based on vector similarity
CREATE OR REPLACE FUNCTION match_candidates_for_job(
    p_job_id UUID,
    p_match_threshold FLOAT DEFAULT 0.5,
    p_match_count INT DEFAULT 20
)
RETURNS TABLE (
    candidate_id UUID,
    full_name VARCHAR,
    email VARCHAR,
    total_experience_months INT,
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
        (1 - (c.profile_embedding <=> j.job_embedding))::FLOAT AS semantic_similarity
    FROM candidates c
    INNER JOIN job_postings j ON j.id = p_job_id
    WHERE c.profile_embedding IS NOT NULL
      AND j.job_embedding IS NOT NULL
      AND (1 - (c.profile_embedding <=> j.job_embedding)) >= p_match_threshold
    ORDER BY c.profile_embedding <=> j.job_embedding
    LIMIT p_match_count;
END;
$$;
