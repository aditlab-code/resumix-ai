import { Worker, Job } from 'bullmq';
import { CV_PARSING_QUEUE_NAME, redisConnectionOptions } from '../config/queue.config';
import { aiClient } from '../services/ai-client.service';
import { dbService } from '../services/db.service';

export interface CVProcessingJobPayload {
  processing_job_id: string;
  document_id: string;
  candidate_id?: string;
  job_id?: string;
  filename: string;
  file_base64: string;
  job_criteria?: {
    mandatory_skills: string[];
    preferred_skills?: string[];
    required_experience_months?: number;
    job_embedding?: number[];
  };
}

export function startCVProcessingWorker(): Worker<CVProcessingJobPayload> {
  const worker = new Worker<CVProcessingJobPayload>(
    CV_PARSING_QUEUE_NAME,
    async (job: Job<CVProcessingJobPayload>) => {
      const { processing_job_id, document_id, job_id, filename, file_base64, job_criteria } = job.data;

      console.log(`[Worker] Processing CV Job ${job.id} for document: ${filename}`);
      await dbService.updateProcessingJobStatus(processing_job_id, 'processing');

      try {
        const fileBuffer = Buffer.from(file_base64, 'base64');

        // Execute complete AI pipeline: PDF extraction -> Groq LLM -> Normalization -> Multilingual Embedding -> Scoring
        const pipelineResult = await aiClient.processFullCVPipeline(fileBuffer, filename, job_criteria);

        // Save Candidate & 384-dim profile & dual-vector embeddings to PostgreSQL pgvector
        const candidateId = await dbService.saveCandidate({
          full_name: pipelineResult.extraction.full_name,
          email: pipelineResult.extraction.contact?.email,
          phone_number: pipelineResult.extraction.contact?.phone_number,
          location: pipelineResult.extraction.contact?.location,
          total_experience_months: pipelineResult.extraction.total_experience_months || 0,
          parsed_cv_json: pipelineResult.extraction,
          profile_embedding: pipelineResult.profile_embedding,
          candidate_skill_embedding: pipelineResult.skill_embedding,
          candidate_role_embedding: pipelineResult.role_embedding,
        });

        // Save Candidate Skills
        if (pipelineResult.normalized_skills.length > 0) {
          await dbService.saveCandidateSkills(candidateId, document_id, pipelineResult.normalized_skills);
        }

        // Link Application and Save Job-Fit Score Breakdown if job_id provided
        if (job_id && pipelineResult.score_breakdown) {
          await dbService.saveApplication({
            candidate_id: candidateId,
            job_id: job_id,
            document_id: document_id,
            job_fit_score: pipelineResult.score_breakdown.final_score,
            score_breakdown: pipelineResult.score_breakdown,
          });
        }

        // Mark processing job as processed
        await dbService.updateProcessingJobStatus(processing_job_id, 'processed');
        console.log(`[Worker] Successfully completed CV processing for document: ${filename} (Candidate ID: ${candidateId})`);
        return { success: true, candidate_id: candidateId };
      } catch (error: any) {
        console.error(`[Worker] Error processing CV job ${job.id}:`, error);

        const isZeroTextLayer = error.message && error.message.includes('NO_TEXT_LAYER');
        const status = isZeroTextLayer ? 'needs_review' : 'failed';
        const errorCode = isZeroTextLayer ? 'NO_TEXT_LAYER' : 'PROCESSING_ERROR';

        await dbService.updateProcessingJobStatus(
          processing_job_id,
          status,
          errorCode,
          error.message || 'Unknown processing error'
        );

        throw error;
      }
    },
    {
      connection: redisConnectionOptions,
      concurrency: 2,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
  });

  return worker;
}
