// Import necessary modules
import Queue from 'bull';
import { ObjectId } from 'mongodb';
import { promises as fsPromises } from 'fs';
import fileUtils from './utils/file';
import userUtils from './utils/user';
import basicUtils from './utils/basic';

// External module for creating image thumbnails
const imageThumbnail = require('image-thumbnail');

// Initialize job queues for file and user processing
const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');

/**
 * File processing worker for creating thumbnails from uploaded images
 */
fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  try {
    // Validate inputs
    if (!userId) throw new Error('Missing userId');
    if (!fileId) throw new Error('Missing fileId');
    if (!basicUtils.isValidId(fileId) || !basicUtils.isValidId(userId)) throw new Error('Invalid fileId or userId');

    // Fetch file information from database
    const file = await fileUtils.getFile({ _id: ObjectId(fileId), userId: ObjectId(userId) });
    if (!file) throw new Error('File not found');

    // Prepare thumbnail generation for different sizes
    const { localPath } = file;
    const thumbnailWidths = [500, 250, 100];
    
    await Promise.all(thumbnailWidths.map(async (width) => {
      const options = { width };
      try {
        const thumbnail = await imageThumbnail(localPath, options);
        await fsPromises.writeFile(`${localPath}_${width}`, thumbnail); // Save the thumbnail
      } catch (err) {
        console.error(`Error generating thumbnail for width ${width}: ${err.message}`);
      }
    }));
  } catch (err) {
    console.error(`Error processing file job: ${err.message}`);
    throw err;
  }
});

/**
 * User processing worker to welcome users by email
 */
userQueue.process(async (job) => {
  const { userId } = job.data;

  try {
    // Validate input
    if (!userId) throw new Error('Missing userId');
    if (!basicUtils.isValidId(userId)) throw new Error('Invalid userId');

    // Fetch user details from database
    const user = await userUtils.getUser({ _id: ObjectId(userId) });
    if (!user) throw new Error('User not found');

    // Log user welcome message
    console.log(`Welcome ${user.email}!`);
  } catch (err) {
    console.error(`Error processing user job: ${err.message}`);
    throw err;
  }
});

