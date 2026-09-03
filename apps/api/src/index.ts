import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { aiClient } from './services/ai-client.service';
import { dbService } from './services/db.service';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Root API info
app.get('/', (req, res) => {
  res.json({
    service: 'CV ATS Core API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/health',
      jobs: '/api/v1/jobs',
      cvEmbedding: '/api/v1/cv/embedding',
      vectorSearch: '/api/v1/jobs/:jobId/candidates/match',
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

router.get('/jobs', (req, res) => {
  res.json({
    data: [
      {
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        title: 'Backend Engineer',
        status: 'open',
        minimum_experience_months: 24,
        mandatory_skills: ['Python', 'PostgreSQL', 'Docker'],
      },
    ],
  });
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
 * Endpoint Ingestion Upload Application
 */
router.post('/jobs/:jobId/applications', (req, res) => {
  const { jobId } = req.params;
  res.status(202).json({
    application_id: '4b7099bb-1e75-4ca1-a243-d2ff1e215c7a',
    document_id: '6f2b98f0-4f4f-43f6-9432-488942782e7b',
    processing_job_id: '8a1198f0-4f4f-43f6-9432-488942782e99',
    processing_status: 'queued',
    message: 'CV berhasil diunggah dan sedang diproses dalam antrean.',
  });
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

app.use('/api/v1', router);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[Core API] Server running on http://localhost:${env.PORT}`);
});

