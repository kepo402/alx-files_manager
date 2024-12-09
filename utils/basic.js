import { ObjectId } from 'mongodb';

/**
 * Utility functions for basic operations.
 */
const utils = {
  /**
   * Validates if the provided ID is a valid MongoDB ObjectId.
   * @param {string|number} id The ID to be checked.
   * @returns {boolean} Returns true if the ID is valid, false otherwise.
   */
  isMongoIdValid(id) {
    try {
      // Attempt to convert the id to an ObjectId
      new ObjectId(id);
      return true;  // Return true if no error occurs
    } catch (error) {
      // Return false if an error occurs (invalid ID)
      return false;
    }
  },
};

// Export the utility functions as default
export default utils;
