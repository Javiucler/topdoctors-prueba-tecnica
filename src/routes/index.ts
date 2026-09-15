import { Router } from "express";
import { labResultRouter } from "./labResult.routes";

const rootRouter = Router();

rootRouter.use("/", labResultRouter);

export default rootRouter;
