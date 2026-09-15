import { Worker, Job } from 'bullmq';
import { LabProcessingJob, LabProcessingDeadLetterQueueJob } from './types';
import { valkeyConnection } from './ioRedisConnection';
import { labProcessingDeadLetterQueue } from './queue';


export const startWorker = () => {
  const worker = new Worker<LabProcessingJob>(
    'lab-processing',
    async (job: Job<LabProcessingJob>) => {
      const attempt = job.attemptsMade + 1;
      const maxAttempts = job.opts.attempts || 3;

      console.log(
        `[JOB STARTED] ID: ${job.id} | Patient: ${job.data.patientId} | Attempt: ${attempt}/${maxAttempts}`
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (Math.random() < 0.5) {
        throw new Error(
          `Transient processing error for patient ${job.data.patientId}`
        );
      }

      console.log(
        `[JOB SUCCESS] ID: ${job.id} | Patient: ${job.data.patientId} successfully processed`
      );

      return { status: 'processed', processedAt: new Date().toISOString() };
    },
    { connection: valkeyConnection }
  );

  worker.on(
    'failed',
    async (job: Job<LabProcessingJob> | undefined, err: Error) => {
      if (!job) return;

      const maxAttempts = job.opts.attempts || 3;

      if (job.attemptsMade < maxAttempts) {
        console.warn(
          `[RETRY ATTEMPT] Job ID: ${job.id} failed (${job.attemptsMade}/${maxAttempts}). Reason: ${err.message}`
        );
      } else {
        console.error(
          `[DEAD-LETTERED] Job ID: ${job.id} reached maximum attempts (${job.attemptsMade}/${maxAttempts}). Moving to DLQ.`
        );

        const dlqPayload: LabProcessingDeadLetterQueueJob = {
          originalJobId: job.id ?? 'unknown',
          payload: job.data,
          source: 'lab-result-service',
          failedReason: err.message,
          stackTrace: err.stack ? err.stack.split('\n') : [''],
          attemptsMade: job.attemptsMade,
          failedAt: new Date().toISOString(),
          queueName: job.queueName,
        };

        await labProcessingDeadLetterQueue.add('dead-letter-job', dlqPayload);
      }
    }
  );

  worker.on('error', (err) => {
    console.error('[WORKER ERROR] Internal BullMQ Worker Error:', err);
  });

  console.log('Worker process initialized and listening for jobs...');
  return worker;
};