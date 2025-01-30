import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.SERVER_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
  username: '',
  password: process.env.REDIS_PASSWORD,
  connectTimeout: 10000,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redisClient;
