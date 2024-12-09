// Import necessary clients and modules
import redisClient from './redis';
import dbClient from './db';

/**
 * User Utilities Module
 * This module contains utility functions for handling user-related operations
 * such as fetching user data from Redis and MongoDB.
 */
const userUtils = {
  
  /**
   * Retrieves the user ID and associated Redis key from the request.
   * @param {Object} request - The express request object containing headers.
   * @returns {Object} - Returns an object with userId and key for the token.
   */
  async getUserIdAndKey(request) {
    const response = {
      userId: null,
      key: null,
    };

    // Extract the X-Token from request headers
    const xToken = request.header('X-Token');
    
    if (!xToken) {
      console.warn('No X-Token provided in the request'); // Log a warning if token is missing
      return response;
    }

    // Create a Redis key for the token
    response.key = `auth_${xToken}`;

    try {
      // Retrieve the userId from Redis using the token's key
      response.userId = await redisClient.get(response.key);
      if (!response.userId) {
        console.warn('User ID not found for token:', xToken); // Log if no userId is found
      }
    } catch (err) {
      console.error('Error accessing Redis for token:', xToken, err); // Handle Redis errors
    }

    return response;
  },

  /**
   * Fetches user data from the MongoDB database based on a query.
   * @param {Object} query - The MongoDB query to locate the user.
   * @returns {Object|null} - The user document if found, otherwise null.
   */
  async getUser(query) {
    try {
      // Query the database for the user matching the provided query
      const user = await dbClient.usersCollection.findOne(query);
      
      if (!user) {
        console.error('User not found for query:', query); // Log if user not found
      }

      return user;
    } catch (err) {
      console.error('Error accessing the database for user:', query, err); // Handle DB errors
      return null;
    }
  },

};

export default userUtils;
