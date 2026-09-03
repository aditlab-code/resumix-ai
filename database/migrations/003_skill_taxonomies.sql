-- Migration: 003_skill_taxonomies.sql
-- Description: Create skill_taxonomies table for storing dynamic custom skill synonyms and categories

CREATE TABLE IF NOT EXISTS skill_taxonomies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canonical_name VARCHAR(100) NOT NULL,
    synonyms TEXT[] NOT NULL DEFAULT '{}',
    category VARCHAR(50) DEFAULT 'other',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Unique index on lowercase canonical name
CREATE UNIQUE INDEX IF NOT EXISTS idx_skill_taxonomies_canonical ON skill_taxonomies (LOWER(canonical_name));

-- Seed default skill taxonomy categories
INSERT INTO skill_taxonomies (canonical_name, synonyms, category) VALUES
    ('Python', ARRAY['python 3', 'py', 'fastapi', 'django', 'flask', 'pydantic'], 'backend'),
    ('PostgreSQL', ARRAY['postgres', 'pg', 'postgresql 15', 'psql', 'sql rdbms'], 'database'),
    ('Docker', ARRAY['docker compose', 'containerization', 'podman', 'docker container'], 'devops'),
    ('Node.js', ARRAY['nodejs', 'node', 'express', 'express.js', 'nestjs', 'ts-node'], 'backend'),
    ('React', ARRAY['react.js', 'reactjs', 'react native'], 'frontend'),
    ('Kubernetes', ARRAY['k8s', 'k3s', 'helm'], 'devops'),
    ('Redis', ARRAY['redis cache', 'in-memory database'], 'database'),
    ('Machine Learning', ARRAY['ml', 'scikit-learn', 'sklearn'], 'data_ai')
ON CONFLICT DO NOTHING;
