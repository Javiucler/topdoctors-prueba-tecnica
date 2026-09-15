import { Queue } from "bullmq";
import { valkeyConnection } from "./ioRedisConnection";
import { LabProcessingDeadLetterQueueJob, LabProcessingJob  } from "./types";


export const labProcessingQueue = new Queue<LabProcessingJob>('lab-processing',{defaultJobOptions: {removeOnComplete: false, removeOnFail: false, attempts: 3}, connection: valkeyConnection});

export const labProcessingDeadLetterQueue = new Queue<LabProcessingDeadLetterQueueJob>('dead-letter-queue', { connection: valkeyConnection})
