import redisClient from './utils/redis.js';

(async () => {
  // Connect to Redis first
  await redisClient.connect();

  console.log('Is Redis Client connected?', redisClient.isAlive());

  // Example: get and set data in Redis
  console.log(await redisClient.get('myKey'));  // Should return null initially
  await redisClient.set('myKey', 12, 5);  // Set value for 5 seconds
  console.log(await redisClient.get('myKey'));  // Should return '12'

  // Wait for key to expire
  setTimeout(async () => {
    console.log(await redisClient.get('myKey'));  // Should return null after 5 seconds
  }, 10000);
})();

