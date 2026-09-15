import express from "express";
import { startWorker } from "./services/bullMQ/worker";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { config } from "./config";

const app = express();
const { port } = config;
app.use(express.json());

app.use("/", routes);
app.use(errorHandler);
startWorker();

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(` Status Dashboard available at http://localhost:${port}/status`);
});
