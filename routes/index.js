import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

function initializeRoutes(app) {
  const router = express.Router();
  app.use('/', router);

  // App Controller Routes
  setupAppRoutes(router);

  // User Controller Routes
  setupUserRoutes(router);

  // Authentication Controller Routes
  setupAuthRoutes(router);

  // Files Controller Routes
  setupFilesRoutes(router);
}

/**
 * Set up the App Controller routes
 */
function setupAppRoutes(router) {
  // Health check: Redis and DB status
  router.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });

  // Get the count of users and files in DB
  router.get('/stats', (req, res) => {
    AppController.getStats(req, res);
  });
}

/**
 * Set up the User Controller routes
 */
function setupUserRoutes(router) {
  // Create a new user in the DB
  router.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });

  // Retrieve the authenticated user's info based on the token
  router.get('/users/me', (req, res) => {
    UsersController.getMe(req, res);
  });
}

/**
 * Set up the Auth Controller routes
 */
function setupAuthRoutes(router) {
  // Sign-in: generate a new authentication token
  router.get('/connect', (req, res) => {
    AuthController.getConnect(req, res);
  });

  // Sign-out: revoke the authentication token
  router.get('/disconnect', (req, res) => {
    AuthController.getDisconnect(req, res);
  });
}

/**
 * Set up the Files Controller routes
 */
function setupFilesRoutes(router) {
  // Upload a new file to the DB and disk
  router.post('/files', (req, res) => {
    FilesController.postUpload(req, res);
  });

  // Retrieve a specific file by its ID
  router.get('/files/:id', (req, res) => {
    FilesController.getShow(req, res);
  });

  // Retrieve a list of files with pagination and filtering by parentId
  router.get('/files', (req, res) => {
    FilesController.getIndex(req, res);
  });

  // Publish a file, making it public
  router.put('/files/:id/publish', (req, res) => {
    FilesController.putPublish(req, res);
  });

  // Unpublish a file, making it private
  router.put('/files/:id/unpublish', (req, res) => {
    FilesController.putUnpublish(req, res);
  });

  // Get the content of a file based on its ID
  router.get('/files/:id/data', (req, res) => {
    FilesController.getFile(req, res);
  });
}

export default initializeRoutes;
