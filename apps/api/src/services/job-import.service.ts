import { aiClient } from './ai-client.service';
import { dbService } from './db.service';

export class JobImportService {
  /**
   * Import raw job description text from LinkedIn or Glints
   * Automatically parses qualifications via Groq LLM, generates 384-dim dual-vector embeddings, and saves to PostgreSQL
   */
  async importJobFromLinkedInText(rawJobText: string): Promise<{
    job_id: string;
    qualifications: {
      title: string;
      company_name?: string;
      department?: string;
      location?: string;
      minimum_experience_months: number;
      mandatory_skills: string[];
      preferred_skills: string[];
      summary: string;
    };
    job_embedding_dimensions: number;
  }> {
    if (!rawJobText || !rawJobText.trim()) {
      throw new Error('Teks deskripsi lowongan tidak boleh kosong.');
    }

    // 1. Call AI Microservice to extract qualifications & generate 384-dim dual-vector embeddings
    const result = await aiClient.extractJobQualifications(rawJobText);
    const { qualifications, job_embedding, job_skill_embedding, job_role_embedding, dimensions } = result;

    // 2. Save parsed job posting & vector embeddings to PostgreSQL pgvector
    const jobId = await dbService.createJobPosting({
      title: qualifications.title,
      description: rawJobText.trim(),
      minimum_experience_months: qualifications.minimum_experience_months,
      mandatory_skills: qualifications.mandatory_skills,
      preferred_skills: qualifications.preferred_skills,
      job_embedding: job_embedding,
      job_skill_embedding: job_skill_embedding,
      job_role_embedding: job_role_embedding,
    });

    return {
      job_id: jobId,
      qualifications,
      job_embedding_dimensions: dimensions,
    };
  }
}

export const jobImportService = new JobImportService();
