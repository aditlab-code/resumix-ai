import { dbService } from './db.service';
import { aiClient } from './ai-client.service';

export interface CreateJobPostingParams {
  title: string;
  description: string;
  minimum_experience_months?: number;
  mandatory_skills: string[];
  preferred_skills?: string[];
}

export class JobService {
  /**
   * Create Job Posting and automatically generate 384-dimensional job_embedding via aiClient
   */
  async createJobPosting(params: CreateJobPostingParams): Promise<{ id: string; job_embedding_generated: boolean }> {
    let jobEmbedding: number[] | undefined;

    try {
      // Build a rich job text for multilingual embedding model (Indonesian & English)
      const textToEmbed = `Job Title: ${params.title}. Minimum Experience: ${params.minimum_experience_months || 0} months. Required Skills: ${params.mandatory_skills.join(', ')}. Description: ${params.description}`;
      const embeddingRes = await aiClient.generateEmbedding({ text: textToEmbed });
      jobEmbedding = embeddingRes.embedding;
    } catch (error) {
      console.warn(`[JobService] Warning: Failed to generate job_embedding automatically:`, error);
    }

    const jobId = await dbService.createJobPosting({
      title: params.title,
      description: params.description,
      minimum_experience_months: params.minimum_experience_months,
      mandatory_skills: params.mandatory_skills,
      preferred_skills: params.preferred_skills,
      job_embedding: jobEmbedding,
    });

    return {
      id: jobId,
      job_embedding_generated: !!jobEmbedding,
    };
  }
}

export const jobService = new JobService();
