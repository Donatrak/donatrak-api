import { createClient } from 'redis';

export const redisClient= createClient({
    url:  process.env.REDIS_URL 
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.connect();  


