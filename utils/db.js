import { MongoClient } from 'mongodb';

// Configuration values for database connection
const {
  DB_HOST = 'localhost',
  DB_PORT = 27017,
  DB_DATABASE = 'files_manager',
} = process.env;

const CONNECTION_URL = `mongodb://${DB_HOST}:${DB_PORT}`;

/**
 * Database Service for managing MongoDB connections and queries.
 */
class DatabaseService {
  constructor() {
    // Connect to the MongoDB server
    MongoClient.connect(CONNECTION_URL, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        console.error(`Connection failed: ${err.message}`);
        this.db = null;
      } else {
        // Initialize database and collections if connection is successful
        this.db = client.db(DB_DATABASE);
        this.usersCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      }
    });
  }

  /**
   * Verifies if the connection to the MongoDB service is active.
   * @returns {boolean} True if connected, false if not.
   */
  isConnected() {
    return Boolean(this.db);
  }

  /**
   * Fetches the total count of users in the 'users' collection.
   * @returns {Promise<number>} The number of users.
   */
  async getUsersCount() {
    try {
      return await this.usersCollection.countDocuments();
    } catch (error) {
      console.error(`Error fetching user count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Fetches the total count of files in the 'files' collection.
   * @returns {Promise<number>} The number of files.
   */
  async getFilesCount() {
    try {
      return await this.filesCollection.countDocuments();
    } catch (error) {
      console.error(`Error fetching file count: ${error.message}`);
      return 0;
    }
  }
}

// Create a singleton instance of the DatabaseService class
const databaseService = new DatabaseService();

// Export the database service instance for external use
export default databaseService;
