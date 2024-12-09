// Importing the database client utility from the utils folder
import dbClient from './utils/db';

// Function to wait for the database connection to become available
const waitConnection = () => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    // Helper function to repeatedly check if the database connection is alive
    const checkConnection = async () => {
      // Delay each check by 1 second
      await setTimeout(() => {
        attempts += 1;

        // If the maximum attempts (10) have been reached, reject the promise
        if (attempts >= 10) {
          console.log('Failed to connect after multiple attempts.');
          reject('Unable to connect to the database.');
        } else if (!dbClient.isAlive()) {
          // If the database is not alive, continue checking
          checkConnection();
        } else {
          // Resolve the promise if the database is connected
          resolve('Database connection established.');
        }
      }, 1000);
    };

    // Start the connection check
    checkConnection();
  });
};

// Main asynchronous function to demonstrate the database client functionality
(async () => {
  // Log the initial status of the database connection
  console.log('Initial Database Connection Status:', dbClient.isAlive());

  // Wait for the database connection to be established
  await waitConnection();

  // Log the status of the database after successfully connecting
  console.log('Database Connection Status after wait:', dbClient.isAlive());

  // Fetch and log the number of users from the database
  const usersCount = await dbClient.nbUsers();
  console.log('Number of Users in the Database:', usersCount);

  // Fetch and log the number of files from the database
  const filesCount = await dbClient.nbFiles();
  console.log('Number of Files in the Database:', filesCount);
})();

