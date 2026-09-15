import { Request, Response, NextFunction } from "express";
import { LabProcessingJob } from "../services/bullMQ/types";
import { labProcessingQueue } from "../services/bullMQ/queue";

export class LabResultController {
  public static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { patientId, labType, result, receivedAt } =
        req.body as Partial<LabProcessingJob>;

      if (!patientId || !labType || !result || !receivedAt) {
        res.status(400).json({
          error: "Validation Error",
          message:
            "Missing required fields: patientId, labType, result, receivedAt",
        });
        return;
      }

      const payload: LabProcessingJob = {
        patientId,
        labType,
        result,
        receivedAt,
      };

      const job = await labProcessingQueue.add("process-lab-result", payload);

      console.log(
        `[JOB RECEIVED] ID: ${job.id} queued for Patient: ${patientId}`,
      );

      res.status(202).json({
        message: "Lab result accepted and queued for processing",
        jobId: job.id,
        patientId,
      });
    } catch (error) {
      next(error);
    }
  }
}
