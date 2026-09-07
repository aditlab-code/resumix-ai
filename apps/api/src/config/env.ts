import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

function requireEnv(name: string, fallback: string = ''): string {
  const value = process.env[name];
  if (!value) {
    console.warn(`[Config Warning] Missing environment variable: ${name}`);
    return fallback;
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || process.env.API_PORT || '3001', 10),
  AI_SERVICE_URL: requireEnv('AI_SERVICE_URL', 'http://localhost:8000'),
  DATABASE_URL: requireEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/cv_ats_db'),
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  REDIS_PREFIX: process.env.REDIS_PREFIX || 'rag_cv',
  REDIS_TLS: process.env.REDIS_TLS === 'true' || (process.env.REDIS_HOST ? process.env.REDIS_HOST.includes('upstash.io') : false),
  SIGNED_URL_TTL_SECONDS: parseInt(process.env.SIGNED_URL_TTL_SECONDS || '300', 10),
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10),
};
