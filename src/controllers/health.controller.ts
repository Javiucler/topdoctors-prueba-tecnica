import { Request, Response, NextFunction } from 'express';
import { labProcessingDeadLetterQueue, labProcessingQueue } from '../services/bullMQ/queue';


export class HealthController {
  public static async getStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const [waiting, active, completed, failed] = await Promise.all([
        labProcessingQueue.getWaitingCount(),
        labProcessingQueue.getActiveCount(),
        labProcessingQueue.getCompletedCount(),
        labProcessingQueue.getFailedCount(),
      ]);

      const deadLettered = await labProcessingDeadLetterQueue.getJobCounts();

      res.status(200).json({
        status: 'HEALTHY',
        timestamp: new Date().toISOString(),
        queueMetrics: {
          waitingJobs: waiting,
          activeJobs: active,
          completedJobs: completed,
          failedInMainQueue: failed,
          deadLetteredJobs: deadLettered,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}