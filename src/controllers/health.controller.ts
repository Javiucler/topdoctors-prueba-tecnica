import { Request, Response, NextFunction } from "express";
import {
  labProcessingDeadLetterQueue,
  labProcessingQueue,
} from "../services/bullMQ/queue";
import { valkeyConnection } from "../services/bullMQ/ioRedisConnection";

export class HealthController {
  public static async getHealth(_req: Request, res: Response): Promise<void> {
    try {
        if (valkeyConnection.status !== "ready") {
        res.status(503).json({
          status: "unhealthy",
          reason: `redis_status_${valkeyConnection.status}`,
        });
        return;
      }
      const redisPing = await valkeyConnection.ping();

      if (redisPing !== "PONG") {
        res
          .status(503)
          .json({ status: "unhealthy", reason: "redis_ping_failed" });
        return;
      }

      res.status(200).json({
        status: "ok",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    } catch {
      res
        .status(503)
        .json({ status: "unhealthy", reason: "redis_unreachable" });
    }
  }

  public static async getStatus(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        labProcessingQueue.getWaitingCount(),
        labProcessingQueue.getActiveCount(),
        labProcessingQueue.getCompletedCount(),
        labProcessingQueue.getFailedCount(),
      ]);

      const deadLettered = await labProcessingDeadLetterQueue.getJobCounts();

      res.status(200).json({
        status: "HEALTHY",
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
