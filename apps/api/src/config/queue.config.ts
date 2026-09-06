import { ConnectionOptions, Queue } from 'bullmq';
import { env } from './env';

export const MAX_JOB_ATTEMPTS = 3;
export const BACKOFF_DELAY_MS = 5000;
export const REMOVE_ON_COMPLETE_COUNT = 100;
export const REMOVE_ON_FAIL_COUNT = 500;

export const redisConnectionOptions: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  tls: env.REDIS_TLS ? {} : undefined,
  maxRetriesPerRequest: null,
};

export const CV_PARSING_QUEUE_NAME = 'cv_processing_queue';

export const cvParsingQueue = new Queue(CV_PARSING_QUEUE_NAME, {
  connection: redisConnectionOptions,
  prefix: env.REDIS_PREFIX,
  defaultJobOptions: {
    attempts: MAX_JOB_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: BACKOFF_DELAY_MS,
    },
    removeOnComplete: REMOVE_ON_COMPLETE_COUNT,
    removeOnFail: REMOVE_ON_FAIL_COUNT,
  },
});
