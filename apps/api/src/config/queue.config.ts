import { ConnectionOptions, Queue } from 'bullmq';
import { env } from './env';

export const redisConnectionOptions: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
};

export const CV_PARSING_QUEUE_NAME = 'cv_processing_queue';

export const cvParsingQueue = new Queue(CV_PARSING_QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});
