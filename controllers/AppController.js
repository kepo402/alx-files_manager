import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {

  /**
   * Checks the status of Redis and the database, returning their current health status.
   * 
   * The method checks if both the Redis client and the database client are alive
   * by calling their respective `isAlive` methods. It then returns a JSON object with
   * the health status of each, indicating `true` if they are alive and `false` otherwise.
   * 
   * @param {Object} request - The HTTP request object
   * @param {Object} response - The HTTP response object
   */
  static async checkSystemHealth(request, response) {
    // Using promises to check the health status of Redis and DB concurrently
    try {
      const [isRedisAlive, isDbAlive] = await Promise.all([
        redisClient.isAlive(), 
        dbClient.isAlive()
      ]);

      // Return the system health status with both Redis and DB statuses
      return response.status(200).json({
        redis: isRedisAlive,
        db: isDbAlive,
      });

    } catch (error) {
      // Return an internal server error if anything goes wrong
      return response.status(500).json({ error: 'Unable to check system health' });
    }
  }

  /**
   * Fetches statistics about the users and files in the database.
   * 
   * The method retrieves the count of users and files in the database and returns
   * these statistics in the form of a JSON object.
   * 
   * @param {Object} request - The HTTP request object
   * @param {Object} response - The HTTP response object
   */
  static async fetchDatabaseStats(request, response) {
    try {
      // Retrieve the count of users and files from the database
      const [userCount, fileCount] = await Promise.all([
        dbClient.nbUsers(), 
        dbClient.nbFiles()
      ]);

      // Return the statistics with the number of users and files
      return response.status(200).json({
        users: userCount,
        files: fileCount,
      });

    } catch (error) {
      // Return an internal server error if fetching statistics fails
      return response.status(500).json({ error: 'Unable to fetch database stats' });
    }
  }
}

export default AppController;

