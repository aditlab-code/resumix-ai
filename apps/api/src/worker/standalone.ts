import { startCVProcessingWorker } from './cv-processing.worker';

console.log('[BullMQ Worker] Starting standalone worker process...');

const worker = startCVProcessingWorker();

console.log('[BullMQ Worker] Worker is active and listening for queued jobs.');

const handleShutdown = async (signal: string): Promise<void> => {
  console.log(`[BullMQ Worker] Received ${signal}. Closing worker gracefully...`);
  try {
    await worker.close();
    console.log('[BullMQ Worker] Worker closed cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('[BullMQ Worker] Error closing worker:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  void handleShutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void handleShutdown('SIGTERM');
});
