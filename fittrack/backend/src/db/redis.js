const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on('error', (err) => console.error('Redis error:', err));

async function connectRedis() {
  await redis.ping();
  console.log('✅ Redis conectado');
}

module.exports = { redis, connectRedis };
