-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums
CREATE TYPE application_status_enum AS ENUM (
    'applied',
    'screening',
    'interview',
    'rejected',
    'hired',
    'withdrawn'
);

CREATE TYPE parse_status_enum AS ENUM (
    'uploaded',
    'queued',
    'processing',
    'processed',
    'needs_review',
    'failed'
);

CREATE TYPE user_role_enum AS ENUM (
    'admin',
    'hr_recruiter',
    'hiring_manager',
    'viewer'
);

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role_enum DEFAULT 'hr_recruiter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Candidates Table
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(50),
    linkedin_url TEXT,
    portfolio_url TEXT,
    location VARCHAR(255),
    total_experience_months INT DEFAULT 0,
    parsed_cv_json JSONB,
    profile_embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Candidate Documents Table
CREATE TABLE candidate_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    size_bytes BIGINT NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    parse_status parse_status_enum DEFAULT 'uploaded',
    parser_metadata JSONB,
    raw_text TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Candidate Skills Table
CREATE TABLE candidate_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    document_id UUID REFERENCES candidate_documents(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    normalized_skill VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'other',
    confidence NUMERIC(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Candidate Experiences Table
CREATE TABLE candidate_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    document_id UUID REFERENCES candidate_documents(id) ON DELETE CASCADE,
    company VARCHAR(255),
    role VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    duration_months INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Candidate Educations Table
CREATE TABLE candidate_educations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    document_id UUID REFERENCES candidate_documents(id) ON DELETE CASCADE,
    institution VARCHAR(255),
    degree VARCHAR(100),
    major VARCHAR(100),
    start_year INT,
    end_year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Job Postings Table
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    minimum_experience_months INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'open',
    job_embedding vector(384),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Job Required Skills Table
CREATE TABLE job_required_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    normalized_skill VARCHAR(100) NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    weight NUMERIC(3, 2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Applications Table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
    document_id UUID REFERENCES candidate_documents(id) ON DELETE CASCADE,
    status application_status_enum DEFAULT 'applied',
    job_fit_score NUMERIC(5, 2),
    score_breakdown JSONB,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Processing Jobs Table
CREATE TABLE processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES candidate_documents(id) ON DELETE CASCADE,
    job_type VARCHAR(50) DEFAULT 'cv_parse',
    status parse_status_enum DEFAULT 'queued',
    attempt_count INT DEFAULT 0,
    error_code VARCHAR(100),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 11. Score Versions Table
CREATE TABLE score_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    formula_version VARCHAR(20) NOT NULL,
    configuration_json JSONB NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_candidate_documents_candidate_id ON candidate_documents(candidate_id);
CREATE INDEX idx_candidate_skills_normalized ON candidate_skills(normalized_skill);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_processing_jobs_document_id ON processing_jobs(document_id);
