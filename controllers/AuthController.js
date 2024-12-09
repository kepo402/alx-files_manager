import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs'; // bcrypt for secure password hashing
import redisClient from '../utils/redis';
import userUtils from '../utils/user';

class AuthController {
  /**
   * Sign in the user by verifying their credentials and generating a token.
   *
   * The process involves:
   * 1. Extracting the Basic Auth credentials (email and password) from the request headers.
   * 2. Finding the user by email in the database.
   * 3. Verifying the user's password using bcrypt's compare method.
   * 4. If the password is correct, generate a new UUID token and store it in Redis.
   * 5. Return the generated token to the user for further authenticated requests.
   */
  static async getConnect(request, response) {
    // 1. Extract the Authorization header and decode it.
    const Authorization = request.header('Authorization');
    if (!Authorization) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    // Split and decode the credentials from Base64.
    const credentials = Authorization.split(' ')[1];
    const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    if (!email || !password) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    // 2. Look for the user by their email address.
    const user = await userUtils.getUser({ email });
    if (!user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    // 3. Use bcrypt to compare the input password with the stored hashed password.
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    // 4. Generate a new authentication token using uuidv4.
    const token = uuidv4();
    const tokenKey = `auth_${token}`;
    const expirationTimeInHours = 24;

    // Store the token in Redis with a 24-hour expiration.
    await redisClient.set(tokenKey, user._id.toString(), expirationTimeInHours * 3600);

    // 5. Respond with the generated token.
    return response.status(200).send({ token });
  }

  /**
   * Sign out the user by removing their session token from Redis.
   *
   * This function:
   * 1. Retrieves the user ID and token key from the request.
   * 2. If the user is found, delete their token from Redis.
   * 3. Return a no-content (204) response indicating the user has been logged out successfully.
   */
  static async getDisconnect(request, response) {
    // 1. Retrieve the user ID and token key from the request.
    const { userId, key } = await userUtils.getUserIdAndKey(request);

    // 2. If the user is not found, respond with Unauthorized.
    if (!userId) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    // 3. Remove the token from Redis to sign out the user.
    await redisClient.del(key);

    // 4. Return a 204 No Content status as there is no content to send back.
    return response.status(204).send();
  }
}

export default AuthController;
