import { Pool } from 'pg';
import { env } from '../config/env';
import { ApplicationStatus, ParseStatus, ScoreBreakdown, CVExtractionDTO, EducationDTO } from '@cv-ats/contracts';


export interface ApplicationRecord {
  application_id: string;
  status: ApplicationStatus;
  job_fit_score: number;
  score_breakdown: ScoreBreakdown;
  applied_at: string;
  candidate_id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  total_experience_months?: number;
  parsed_cv_json?: CVExtractionDTO;
}

export interface ProcessingJobRecord {
  id: string;
  document_id: string;
  job_type: string;
  status: ParseStatus;
  attempt_count: number;
  error_code?: string;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface JobPostingRecord {
  id: string;
  title: string;
  description: string;
  minimum_experience_months: number;
  status: string;
  created_at: string;
}

export class DBService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: env.DATABASE_URL,
    });
  }

  /**
   * Helper to format a float array into pgvector literal syntax string: '[0.1, 0.2, ...]'
   */
  public formatVector(vec?: number[]): string | null {
    if (!vec || !Array.isArray(vec) || vec.length === 0) return null;
    return `[${vec.join(',')}]`;
  }

  /**
   * Save extracted candidate profile & dual-vector embeddings into PostgreSQL
   */
  async saveCandidate(data: {
    full_name?: string;
    email?: string;
    phone_number?: string;
    location?: string;
    total_experience_months?: number;
    parsed_cv_json: Record<string, any>;
    profile_embedding: number[];
    candidate_skill_embedding?: number[];
    candidate_role_embedding?: number[];
  }): Promise<string> {
    const vectorString = this.formatVector(data.profile_embedding);
    const skillVectorString = this.formatVector(data.candidate_skill_embedding);
    const roleVectorString = this.formatVector(data.candidate_role_embedding);

    const query = `
      INSERT INTO candidates (
        full_name, email, phone_number, location,
        total_experience_months, parsed_cv_json, profile_embedding,
        candidate_skill_embedding, candidate_role_embedding
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::vector, $8::vector, $9::vector)
      RETURNING id;
    `;

    const values = [
      data.full_name || null,
      data.email || null,
      data.phone_number || null,
      data.location || null,
      data.total_experience_months || 0,
      JSON.stringify(data.parsed_cv_json),
      vectorString,
      skillVectorString,
      roleVectorString,
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Save Candidate Normalized Skills
   */
  async saveCandidateSkills(candidateId: string, documentId: string, skills: string[]): Promise<void> {
    for (const skill of skills) {
      await this.pool.query(
        `INSERT INTO candidate_skills (candidate_id, document_id, skill_name, normalized_skill)
         VALUES ($1, $2, $3, $4)`,
        [candidateId, documentId, skill, skill]
      );
    }
  }

  /**
   * Save Candidate Educations History
   */
  async saveCandidateEducations(candidateId: string, documentId: string, educations: EducationDTO[]): Promise<void> {
    for (const edu of educations) {
      await this.pool.query(
        `INSERT INTO candidate_educations (candidate_id, document_id, institution, degree, major, start_year, end_year, gpa)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          candidateId,
          documentId,
          edu.institution || null,
          edu.degree || null,
          edu.major || null,
          edu.start_year || null,
          edu.end_year || null,
          edu.gpa ? String(edu.gpa) : null,
        ]
      );
    }
  }


  /**
   * Save Application Record & Score Breakdown
   */
  async saveApplication(data: {
    candidate_id: string;
    job_id: string;
    document_id: string;
    job_fit_score: number;
    score_breakdown: Record<string, any>;
  }): Promise<string> {
    const query = `
      INSERT INTO applications (candidate_id, job_id, document_id, job_fit_score, score_breakdown)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    const result = await this.pool.query(query, [
      data.candidate_id,
      data.job_id,
      data.document_id,
      data.job_fit_score,
      JSON.stringify(data.score_breakdown),
    ]);
    return result.rows[0].id;
  }

  /**
   * Create Job Posting with automatic dual-vector pgvector embeddings
   */
  async createJobPosting(data: {
    title: string;
    description: string;
    minimum_experience_months?: number;
    mandatory_skills: string[];
    preferred_skills?: string[];
    job_embedding?: number[];
    job_skill_embedding?: number[];
    job_role_embedding?: number[];
  }): Promise<string> {
    const vectorString = this.formatVector(data.job_embedding);
    const skillVectorString = this.formatVector(data.job_skill_embedding);
    const roleVectorString = this.formatVector(data.job_role_embedding);

    const query = `
      INSERT INTO job_postings (
        title, description, minimum_experience_months, job_embedding,
        job_skill_embedding, job_role_embedding
      ) VALUES ($1, $2, $3, $4::vector, $5::vector, $6::vector)
      RETURNING id;
    `;

    const result = await this.pool.query(query, [
      data.title,
      data.description,
      data.minimum_experience_months || 0,
      vectorString,
      skillVectorString,
      roleVectorString,
    ]);

    const jobId = result.rows[0].id;

    // Insert required skills
    for (const skill of data.mandatory_skills) {
      await this.pool.query(
        `INSERT INTO job_required_skills (job_id, skill_name, normalized_skill, is_mandatory) VALUES ($1, $2, $3, true)`,
        [jobId, skill, skill.toLowerCase().trim()]
      );
    }

    if (data.preferred_skills) {
      for (const skill of data.preferred_skills) {
        await this.pool.query(
          `INSERT INTO job_required_skills (job_id, skill_name, normalized_skill, is_mandatory) VALUES ($1, $2, $3, false)`,
          [jobId, skill, skill.toLowerCase().trim()]
        );
      }
    }

    return jobId;
  }

  /**
   * Update Processing Job Status in PostgreSQL
   */
  async updateProcessingJobStatus(
    processingJobId: string,
    status: 'uploaded' | 'queued' | 'processing' | 'processed' | 'needs_review' | 'failed',
    errorCode?: string,
    errorMessage?: string
  ): Promise<void> {
    const query = `
      UPDATE processing_jobs
      SET status = $1, error_code = $2, error_message = $3,
          completed_at = CASE WHEN $1 IN ('processed', 'needs_review', 'failed') THEN CURRENT_TIMESTAMP ELSE completed_at END
      WHERE id = $4;
    `;
    await this.pool.query(query, [status, errorCode || null, errorMessage || null, processingJobId]);
  }

  /**
   * Perform pgvector cosine similarity search using match_candidates_for_job function
   */
  async matchCandidatesForJob(
    jobId: string,
    threshold: number = 0.5,
    limit: number = 20
  ): Promise<
    Array<{
      candidate_id: string;
      full_name: string;
      email: string;
      total_experience_months: number;
      skill_similarity: number;
      role_similarity: number;
      semantic_similarity: number;
    }>
  > {
    const query = `
      SELECT * FROM match_candidates_for_job($1, $2, $3);
    `;

    const result = await this.pool.query(query, [jobId, threshold, limit]);
    return result.rows;
  }

  async updateApplicationStatus(applicationId: string, status: string): Promise<void> {
    const query = `
      UPDATE applications
      SET status = $1
      WHERE id = $2;
    `;
    await this.pool.query(query, [status, applicationId]);
  }

  async getApplicationsByJobId(jobId: string): Promise<ApplicationRecord[]> {
    const query = `
      SELECT 
        a.id as application_id,
        a.status,
        a.job_fit_score,
        a.score_breakdown,
        a.applied_at,
        c.id as candidate_id,
        c.full_name,
        c.email,
        c.phone_number,
        c.total_experience_months,
        c.parsed_cv_json
      FROM applications a
      JOIN candidates c ON a.candidate_id = c.id
      WHERE a.job_id = $1
      ORDER BY a.job_fit_score DESC;
    `;
    const result = await this.pool.query<ApplicationRecord>(query, [jobId]);
    return result.rows;
  }

  async getProcessingJob(processingJobId: string): Promise<ProcessingJobRecord | null> {
    const query = `
      SELECT id, document_id, job_type, status, attempt_count, error_code, error_message, started_at, completed_at
      FROM processing_jobs
      WHERE id = $1;
    `;
    const result = await this.pool.query<ProcessingJobRecord>(query, [processingJobId]);
    return result.rows[0] || null;
  }

  async getJobs(): Promise<JobPostingRecord[]> {
    const query = `
      SELECT id, title, description, minimum_experience_months, status, created_at
      FROM job_postings
      ORDER BY created_at DESC;
    `;
    const result = await this.pool.query<JobPostingRecord>(query);
    return result.rows;
  }

  async deleteJob(jobId: string): Promise<void> {
    await this.pool.query(`DELETE FROM applications WHERE job_id = $1;`, [jobId]);
    await this.pool.query(`DELETE FROM job_required_skills WHERE job_id = $1;`, [jobId]);
    await this.pool.query(`DELETE FROM job_postings WHERE id = $1;`, [jobId]);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const dbService = new DBService();

