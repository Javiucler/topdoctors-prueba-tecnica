import { Router } from 'express';
import { labResultRouter } from './labResult.routes'

const rootRouter = Router();

// Mount sub-routers (you can prefix routes here if needed, e.g., '/api/v1')
rootRouter.use('/', labResultRouter);

export default rootRouter;