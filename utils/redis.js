import { createClient } from 'redis';

class RedisClient {
  constructor() {
    // Initialize Redis client
    this.client = createClient({
      url: 'redis://127.0.0.1:6379',
    });

    // Handle Redis connection events
    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });

    this.client.on('error', (err) => {
      console.error('Error connecting to Redis:', err);
    });

    this.client.on('ready', () => {
      console.log('Redis Client is ready!');
    });
  }

  // Connect to Redis client
  async connect() {
    try {
      await this.client.connect();
      console.log('Redis client successfully connected!');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }

  // Check if the Redis client is alive
  isAlive() {
    return this.client.isReady;
  }

  // Get a value from Redis by key
  async get(key) {
    return await this.client.get(key);
  }

  // Set a value in Redis with an expiration time
  async set(key, value, duration) {
    await this.client.set(key, value, { EX: duration });
  }

  // Delete a key from Redis
  async del(key) {
    await this.client.del(key);
  }
}

// Export RedisClient instance
const redisClient = new RedisClient();
export default redisClient;

