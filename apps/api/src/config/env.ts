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
  PORT: parseInt(requireEnv('API_PORT'), 10),
  AI_SERVICE_URL: requireEnv('AI_SERVICE_URL'),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  SIGNED_URL_TTL_SECONDS: parseInt(process.env.SIGNED_URL_TTL_SECONDS || '300', 10),
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10),
};
