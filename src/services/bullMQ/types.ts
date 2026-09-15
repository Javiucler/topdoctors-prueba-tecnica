export interface LabProcessingJob {
  patientId: string;
  labType: string;
  result: string;
  receivedAt: string;
}

export interface LabProcessingDeadLetterQueueJob {
  originalJobId: string;
  payload: LabProcessingJob;
  source: string;
  failedReason: string;
  stackTrace?: string[];
  attemptsMade: number;
  failedAt: string;
  queueName: string;
}
