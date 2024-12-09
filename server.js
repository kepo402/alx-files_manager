// Import necessary modules
import express from 'express';
import controllerRouting from './routes/index';

/**
 * File Manager Platform - Backend Overview
 *
 * This project demonstrates fundamental backend concepts such as:
 * - User authentication with tokens
 * - File upload and viewing functionality
 * - File permissions management
 * - Image thumbnail generation
 * - Integration with MongoDB and Redis
 * - Background job processing
 *
 * Core features:
 * 1. User authentication using tokens
 * 2. Upload and list files
 * 3. View files and update permissions
 * 4. Generate image thumbnails
 */

const app = express();  // Initialize Express application
const port = process.env.PORT || 5000;  // Set port from environment or default to 5000

/**
 * Middleware Configuration
 * - Body parser middleware for parsing incoming JSON requests
 */
app.use(express.json());  // Parse incoming requests with JSON payloads

/**
 * Controller Routing
 * - Route handlers are registered via a dedicated routing module
 */
controllerRouting(app);  // Initialize routing from external controller file

/**
 * Start the server
 * - The server listens on the specified port and logs a success message upon starting
 */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);  // Log server start message
});

// Export the app for testing or further use
export default app;
