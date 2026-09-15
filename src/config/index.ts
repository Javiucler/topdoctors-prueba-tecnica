export const config = {
    port: Number(process.env.port) || 3000,
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: Number(process.env.REDIS_PORT) || 6379
}