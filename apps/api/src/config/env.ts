import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.API_PORT || process.env.PORT || '3001', 10),
  AI_SERVICE_URL: requireEnv('AI_SERVICE_URL'),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  REDIS_PREFIX: process.env.REDIS_PREFIX || 'rag_cv',
  REDIS_TLS: process.env.REDIS_TLS === 'true' || (process.env.REDIS_HOST ? process.env.REDIS_HOST.includes('upstash.io') : false),
  SIGNED_URL_TTL_SECONDS: parseInt(process.env.SIGNED_URL_TTL_SECONDS || '300', 10),
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10),
};
