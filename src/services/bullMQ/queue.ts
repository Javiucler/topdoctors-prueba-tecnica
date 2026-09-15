import { Queue } from "bullmq";
import { valkeyConnection } from "./ioRedisConnection";
import { LabProcessingDeadLetterQueueJob, LabProcessingJob } from "./types";

export const labProcessingQueue = new Queue<LabProcessingJob>(
  "lab-processing",
  {
    defaultJobOptions: {
      removeOnComplete: { count: 1000, age: 86400 },
      removeOnFail: false,
      attempts: 3,
    },
    connection: valkeyConnection,
  },
);

export const labProcessingDeadLetterQueue =
  new Queue<LabProcessingDeadLetterQueueJob>("dead-letter-queue", {
    connection: valkeyConnection,
  });
