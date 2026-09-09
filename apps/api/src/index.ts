import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { aiClient } from './services/ai-client.service';
import { dbService } from './services/db.service';
import { jobService } from './services/job.service';
import { jobImportService } from './services/job-import.service';
import { cvParsingQueue } from './config/queue.config';
import { startCVProcessingWorker } from './worker/cv-processing.worker';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize BullMQ Worker in background
let cvWorker: ReturnType<typeof startCVProcessingWorker> | undefined;
try {
  cvWorker = startCVProcessingWorker();
  console.log('[Core API] Async BullMQ CV Processing Worker initialized.');
} catch (err) {
  console.warn('[Core API] Warning: Failed to start BullMQ Worker (Redis might be offline):', err);
}

// Root API info
app.get('/', (req, res) => {
  res.json({
    service: 'Resumix AI Core API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/health',
      jobs: '/api/v1/jobs',
      importLinkedIn: '/api/v1/jobs/import-linkedin',
      cvEmbedding: '/api/v1/cv/embedding',
      vectorSearch: '/api/v1/jobs/:jobId/candidates/match',
      evaluateInstant: '/api/v1/jobs/:jobId/evaluate-instant',
    },
  });
});

// Health Check
app.get('/health', async (req, res, next) => {
  try {
    const aiHealth = await aiClient.checkHealth().catch((err) => ({ status: 'degraded', error: err.message }));
    res.json({ status: 'ok', service: 'core-api', env: env.NODE_ENV, ai_service: aiHealth });
  } catch (error) {
    next(error);
  }
});

// API Routes prefix v1
const router = express.Router();

router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await dbService.getJobs();
    return res.json({ data: jobs });
  } catch (error) {
    return next(error);
  }
});

router.delete('/jobs/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    await dbService.deleteJob(jobId);
    return res.json({
      job_id: jobId,
      message: `Lowongan kerja '${jobId}' berhasil dihapus permanen.`,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Import and Parse Raw Job Description from LinkedIn / Glints via Groq LLM + Auto Job Embedding
 */
router.post('/jobs/import-linkedin', async (req, res, next) => {
  try {
    const { raw_text } = req.body;
    if (!raw_text || !raw_text.trim()) {
      return res.status(400).json({ error: { message: "Teks deskripsi lowongan kerja ('raw_text') wajib diisi." } });
    }

    const result = await jobImportService.importJobFromLinkedInText(raw_text);

    return res.status(201).json({
      message: 'Lowongan kerja dari LinkedIn/Glints berhasil di-import dan di-embedding.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Create Job Posting with automatic 384-dim job_embedding generation
 */
router.post('/jobs', async (req, res, next) => {
  try {
    const { title, description, minimum_experience_months, mandatory_skills, preferred_skills } = req.body;
    if (!title || !description || !mandatory_skills) {
      return res.status(400).json({ error: { message: "Field 'title', 'description', dan 'mandatory_skills' wajib diisi." } });
    }

    const result = await jobService.createJobPosting({
      title,
      description,
      minimum_experience_months,
      mandatory_skills,
      preferred_skills,
    });

    return res.status(201).json({
      message: 'Lowongan kerja berhasil dibuat.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Generate 384-dimensional Multilingual Vector Embedding (Indonesian & English)
 */
router.post('/cv/embedding', async (req, res, next) => {
  try {
    const { text, cv_extraction } = req.body;
    if (!text && !cv_extraction) {
      return res.status(400).json({ error: { message: "Harap sediakan 'text' atau 'cv_extraction'." } });
    }
    const result = await aiClient.generateEmbedding({ text, cv_extraction });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

/**
 * Asynchronous Ingestion Upload Application (< 200ms non-blocking response)
 */
router.post('/jobs/:jobId/applications', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { filename, file_base64, job_criteria } = req.body;

    const applicationId = `app-${randomUUID()}`;
    const documentId = `doc-${randomUUID()}`;
    const processingJobId = `proc-${randomUUID()}`;

    if (!filename || !file_base64) {
      return res.status(400).json({
        error: { message: 'Parameters filename dan file_base64 wajib diisi.' },
      });
    }

    // Enqueue to Redis BullMQ Queue
    await cvParsingQueue.add('cv_parse_job', {
      processing_job_id: processingJobId,
      document_id: documentId,
      job_id: jobId,
      filename,
      file_base64,
      job_criteria,
    });

    return res.status(202).json({
      application_id: applicationId,
      document_id: documentId,
      processing_job_id: processingJobId,
      processing_status: 'queued',
      message: 'CV berhasil diunggah dan sedang diproses dalam antrean.',
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Real-Time Instant Synchronous CV Match Evaluation Endpoint
 */
router.post('/jobs/:jobId/evaluate-instant', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { filename, file_base64, job_criteria } = req.body;

    if (!file_base64 || !filename) {
      return res.status(400).json({ error: { message: "Field 'filename' dan 'file_base64' (PDF) wajib diisi." } });
    }

    const fileBuffer = Buffer.from(file_base64, 'base64');
    const result = await aiClient.processFullCVPipeline(fileBuffer, filename, job_criteria);

    return res.json({
      job_id: jobId,
      evaluation_type: 'instant_synchronous',
      candidate_summary: {
        full_name: result.extraction.full_name,
        email: result.extraction.contact?.email,
        total_experience_months: result.extraction.total_experience_months || 0,
      },
      normalized_skills: result.normalized_skills,
      profile_embedding_dimensions: result.profile_embedding.length,
      score_breakdown: result.score_breakdown,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Perform pgvector Cosine Similarity Match for Job
 */
router.get('/jobs/:jobId/candidates/match', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const threshold = parseFloat((req.query.threshold as string) || '0.5');
    const limit = parseInt((req.query.limit as string) || '20', 10);

    const matches = await dbService.matchCandidatesForJob(jobId, threshold, limit);
    return res.json({ job_id: jobId, threshold, count: matches.length, matches });
  } catch (error) {
    return next(error);
  }
});

/**
 * Get Applications for a specific Job Posting
 */
router.get('/jobs/:jobId/applications', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const apps = await dbService.getApplicationsByJobId(jobId);
    return res.json({ job_id: jobId, data: apps });
  } catch (error) {
    return next(error);
  }
});

/**
 * Update Application Recruitment Stage Status
 */
router.patch('/applications/:applicationId/status', async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = ['applied', 'screening', 'interview', 'hired', 'rejected', 'withdrawn'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: { message: `Status tidak valid. Harus salah satu dari: ${validStatuses.join(', ')}` },
      });
    }

    await dbService.updateApplicationStatus(applicationId, status);

    return res.json({
      application_id: applicationId,
      status,
      message: `Status aplikasi berhasil diperbarui menjadi '${status}'.`,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Poll Processing Job Status for Async CV Parsing
 */
router.get('/processing-jobs/:processingJobId', async (req, res, next) => {
  try {
    const { processingJobId } = req.params;
    const jobStatus = await dbService.getProcessingJob(processingJobId);
    if (!jobStatus) {
      return res.status(404).json({
        error: { message: `Processing job '${processingJobId}' tidak ditemukan.` },
      });
    }
    return res.json({ data: jobStatus });
  } catch (error) {
    return next(error);
  }
});

app.use('/api/v1', router);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`[Core API] Server running on http://localhost:${env.PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`[Core API] Received ${signal}. Shutting down gracefully...`);

  // Stop accepting new jobs and drain in-flight jobs before closing server
  if (cvWorker) {
    await cvWorker.close();
    console.log('[Core API] BullMQ Worker drained and closed.');
  }

  server.close(async () => {
    try {
      await dbService.close();
      console.log('[Core API] Database connections closed.');
      process.exit(0);
    } catch (err) {
      console.error('[Core API] Error closing connections:', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));

