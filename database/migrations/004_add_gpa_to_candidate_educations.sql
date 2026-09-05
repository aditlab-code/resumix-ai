-- 004_add_gpa_to_candidate_educations.sql
-- Add gpa/IPK column to candidate_educations table

ALTER TABLE candidate_educations ADD COLUMN IF NOT EXISTS gpa VARCHAR(50);
