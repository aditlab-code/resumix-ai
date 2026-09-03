-- Initial Seed Data

-- Insert Default Admin/HR User
INSERT INTO users (id, email, password_hash, full_name, role)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'hr.admin@example.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- hashed 'password123'
    'HR Lead Recruiter',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert Baseline Score Version
INSERT INTO score_versions (id, name, formula_version, configuration_json, active)
VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Baseline ATS Weighted Formula',
    'v1',
    '{
        "weights": {
            "semantic_similarity": 0.45,
            "mandatory_skills": 0.30,
            "experience": 0.20,
            "preferred_skills": 0.05
        }
    }'::jsonb,
    TRUE
);

-- Insert Sample Job Posting
INSERT INTO job_postings (id, title, description, minimum_experience_months, status, created_by)
VALUES (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Backend Engineer',
    'Kami mencari Backend Engineer berpengalaman dalam Node.js, Python, PostgreSQL, dan Docker untuk membangun sistem ATS berbasis AI.',
    24,
    'open',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);

-- Insert Required Skills for Job Posting
INSERT INTO job_required_skills (job_id, skill_name, normalized_skill, is_mandatory, weight)
VALUES 
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Python', 'Python', TRUE, 1.0),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'PostgreSQL', 'PostgreSQL', TRUE, 1.0),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Docker', 'Docker', TRUE, 1.0),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Redis', 'Redis', FALSE, 0.5);
