import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import Queue from 'bull';
import dbClient from '../utils/db';
import userUtils from '../utils/user';

// Queue for user-related background tasks
const userProcessingQueue = new Queue('userProcessingQueue');

class UsersController {
  
  /**
   * Registers a new user using email and password
   * 
   * The method checks if email and password are provided, validates email uniqueness,
   * and stores the password securely as a hashed value using SHA-1.
   * If any error occurs, appropriate error messages are returned.
   * 
   * @param {Object} request - The HTTP request object containing user data
   * @param {Object} response - The HTTP response object
   */
  static async registerUser(request, response) {
    const { email, password } = request.body;

    // Validate input
    if (!email) {
      return response.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Password is required' });
    }

    // Check if email already exists in the database
    const existingUser = await dbClient.usersCollection.findOne({ email });
    if (existingUser) {
      return response.status(400).json({ error: 'Email already in use' });
    }

    // Hash the password using SHA-1
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    let createdUser;
    try {
      // Insert the new user into the database
      createdUser = await dbClient.usersCollection.insertOne({ email, password: hashedPassword });
    } catch (error) {
      // In case of error, trigger background processing and return server error response
      await userProcessingQueue.add({});
      return response.status(500).json({ error: 'Failed to create user' });
    }

    // Prepare the user data to return (only email and id)
    const userResponse = {
      id: createdUser.insertedId,
      email,
    };

    // Add a background task to process the newly created user
    await userProcessingQueue.add({ userId: createdUser.insertedId.toString() });

    // Return the created user response
    return response.status(201).json(userResponse);
  }

  /**
   * Retrieves the currently authenticated user's details using the provided token
   * 
   * If the user is not found or token is invalid, return an Unauthorized error.
   * Otherwise, return the user's basic information (email and id).
   * 
   * @param {Object} request - The HTTP request object containing authorization token
   * @param {Object} response - The HTTP response object
   */
  static async getCurrentUser(request, response) {
    const { userId } = await userUtils.extractUserIdAndKey(request);

    // Fetch user from the database using the userId from the token
    const user = await userUtils.getUser({ _id: ObjectId(userId) });

    // Return an Unauthorized error if user is not found
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized access' });
    }

    // Prepare the user response by removing sensitive fields (e.g., password)
    const userData = {
      id: user._id,
      email: user.email,
    };

    // Return the sanitized user data
    return response.status(200).json(userData);
  }
}

export default UsersController;
