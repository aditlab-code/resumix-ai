import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Root API info
app.get('/', (req, res) => {
  res.json({
    service: 'CV ATS Core API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/health',
      jobs: '/api/v1/jobs',
    },
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'core-api', env: env.NODE_ENV });
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

app.use('/api/v1', router);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[Core API] Server running on http://localhost:${env.PORT}`);
});
