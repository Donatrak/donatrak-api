import redis from 'redis';

export const redisClient = redis.createClient({
    url: `redis://localhost:${REDIS_PORT}`
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.connect()
    .then(() => {
        console.log('Connected to Redis')
    })
    .catch((err) => {
        console.error('Failed to connect to Redis:', err)
    });


