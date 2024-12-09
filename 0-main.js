// Importing the redisClient utility from the utils folder
import redisClient from './utils/redis';

// Immediately Invoked Function Expression (IIFE) to execute the code asynchronously
(async () => {
  // Check if the Redis client is alive and output the result
  console.log("Redis Client Alive:", redisClient.isAlive());

  // Fetch the value of 'myKey' from Redis and log the result
  const initialValue = await redisClient.get('myKey');
  console.log("Initial Value of 'myKey':", initialValue);

  // Set the value of 'myKey' to 12 with an expiration time of 5 seconds
  await redisClient.set('myKey', 12, 5);
  console.log("Updated Value of 'myKey' (set to 12):", await redisClient.get('myKey'));

  // Set a timeout to log the value of 'myKey' after 10 seconds
  setTimeout(async () => {
    const expiredValue = await redisClient.get('myKey');
    console.log("Value of 'myKey' after 10 seconds (should be expired):", expiredValue);
  }, 1000 * 10); // 10 seconds timeout
})();

