import { createClient } from 'redis';
import { promisify } from 'util';

/**
 * Redis utility class to manage caching and data retrieval.
 */
class RedisService {
  constructor() {
    // Initialize Redis client
    this.client = createClient();

    // Promisify the get operation for async usage
    this.getAsync = promisify(this.client.get).bind(this.client);

    // Set up error handling for Redis connection
    this.client.on('error', (err) => {
      console.error(`Redis error: ${err.message}`);
    });

    // Set up connection established handler
    this.client.on('connect', () => {
      // Optional: Log when connected to Redis
      // console.log('Successfully connected to Redis');
    });
  }

  /**
   * Verifies the connection status to Redis server.
   * @returns {boolean} Returns true if connected, false otherwise.
   */
  isConnectionActive() {
    return this.client.connected;
  }

  /**
   * Fetches the value for a given key from Redis.
   * @param {string} key The key to retrieve from Redis.
   * @returns {Promise<string>} The value associated with the key.
   */
  async fetch(key) {
    try {
      return await this.getAsync(key);
    } catch (error) {
      console.error(`Failed to get key: ${key}. Error: ${error.message}`);
    }
  }

  /**
   * Stores a key-value pair in Redis with a specified TTL (Time To Live).
   * @param {string} key The key to set in Redis.
   * @param {string} value The value to associate with the key.
   * @param {number} ttl The time-to-live for the key in seconds.
   */
  async store(key, value, ttl) {
    this.client.setex(key, ttl, value, (err) => {
      if (err) {
        console.error(`Failed to set key: ${key}. Error: ${err.message}`);
      }
    });
  }

  /**
   * Removes a key from Redis.
   * @param {string} key The key to remove from Redis.
   */
  async remove(key) {
    this.client.del(key, (err) => {
      if (err) {
        console.error(`Failed to delete key: ${key}. Error: ${err.message}`);
      }
    });
  }
}

// Create a singleton instance of the RedisService class
const redisService = new RedisService();

// Export the Redis service instance for external usage
export default redisService;
