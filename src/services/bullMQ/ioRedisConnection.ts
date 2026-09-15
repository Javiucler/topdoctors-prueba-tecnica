import IORedis from "ioredis";
import { config } from "../../config";

const { redisHost, redisPort } = config;

export const valkeyConnection = new IORedis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
  connectTimeout: 15000,
});
