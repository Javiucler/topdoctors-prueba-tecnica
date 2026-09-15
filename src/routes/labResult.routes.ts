import { Router } from "express";
import { LabResultController } from "../controllers/labResult.controller";
import { HealthController } from "../controllers/health.controller";

export const labResultRouter = Router();

labResultRouter.post("/lab-results", LabResultController.create);
labResultRouter.get("/health", HealthController.getHealth);
labResultRouter.get("/status", HealthController.getStatus);
