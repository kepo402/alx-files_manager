import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';
import dbClient from './db';
import userUtils from './user';
import basicUtils from './basic';

/**
 * Utility functions related to file operations.
 */
const fileUtils = {
  /**
   * Validates the body of a request for creating a file.
   * @param {object} request - Express request object containing file data.
   * @returns {object} - Object containing error message and validated file parameters.
   */
  async validateFileBody(request) {
    const { name, type, isPublic = false, data, parentId = 0 } = request.body;
    const allowedTypes = ['file', 'image', 'folder'];
    let errorMessage = null;

    if (parentId === '0') parentId = 0;

    if (!name) {
      errorMessage = 'Missing name';
    } else if (!type || !allowedTypes.includes(type)) {
      errorMessage = 'Invalid type';
    } else if (!data && type !== 'folder') {
      errorMessage = 'Missing data';
    } else if (parentId && parentId !== '0') {
      let parentFile;

      if (basicUtils.isValidId(parentId)) {
        parentFile = await this.getFile({ _id: ObjectId(parentId) });
      }

      if (!parentFile) {
        errorMessage = 'Parent not found';
      } else if (parentFile.type !== 'folder') {
        errorMessage = 'Parent is not a folder';
      }
    }

    return {
      error: errorMessage,
      fileParams: { name, type, parentId, isPublic, data },
    };
  },

  /**
   * Retrieves a file document from the database based on the query.
   * @param {object} query - Query to find the file.
   * @returns {object|null} - The file document or null if not found.
   */
  async getFile(query) {
    const file = await dbClient.filesCollection.findOne(query);
    return file;
  },

  /**
   * Retrieves a list of file documents from the database for a specific parent ID.
   * @param {object} query - Query to find files of a parent.
   * @returns {Array} - List of file documents.
   */
  async getFilesByParentId(query) {
    const fileList = await dbClient.filesCollection.aggregate(query);
    return fileList;
  },

  /**
   * Saves a file to the database and disk.
   * @param {string} userId - The ID of the user saving the file.
   * @param {object} fileParams - The parameters of the file to save.
   * @param {string} folderPath - The folder path to save the file on disk.
   * @returns {object} - Object containing error (if any) and the new file document.
   */
  async saveFile(userId, fileParams, folderPath) {
    const { name, type, isPublic, data, parentId = 0 } = fileParams;
    const query = { userId: ObjectId(userId), name, type, isPublic, parentId: parentId !== 0 ? ObjectId(parentId) : 0 };

    if (type !== 'folder') {
      const fileNameUUID = uuidv4();
      const fileDataDecoded = Buffer.from(data, 'base64');
      const path = `${folderPath}/${fileNameUUID}`;

      query.localPath = path;

      try {
        await fsPromises.mkdir(folderPath, { recursive: true });
        await fsPromises.writeFile(path, fileDataDecoded);
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }

    const result = await dbClient.filesCollection.insertOne(query);
    const file = this.transformFileDocument(query);

    return { error: null, newFile: { id: result.insertedId, ...file } };
  },

  /**
   * Updates a file document in the database.
   * @param {object} query - The query to find the file document.
   * @param {object} update - The update operation to apply.
   * @returns {object} - The updated file document.
   */
  async updateFile(query, update) {
    const updatedFile = await dbClient.filesCollection.findOneAndUpdate(
      query,
      { $set: update },
      { returnOriginal: false }
    );
    return updatedFile.value;
  },

  /**
   * Publishes or unpublishes a file.
   * @param {object} request - Express request object containing the file ID.
   * @param {boolean} setPublish - Whether to set the file as public (true) or private (false).
   * @returns {object} - Error (if any), status code, and the updated file.
   */
  async publishUnpublishFile(request, setPublish) {
    const { id: fileId } = request.params;
    if (!basicUtils.isValidId(fileId)) return { error: 'Unauthorized', code: 401 };

    const { userId } = await userUtils.getUserIdAndKey(request);
    if (!basicUtils.isValidId(userId)) return { error: 'Unauthorized', code: 401 };

    const user = await userUtils.getUser({ _id: ObjectId(userId) });
    if (!user) return { error: 'Unauthorized', code: 401 };

    const file = await this.getFile({ _id: ObjectId(fileId), userId: ObjectId(userId) });
    if (!file) return { error: 'Not found', code: 404 };

    const updatedFile = await this.updateFile({ _id: ObjectId(fileId), userId: ObjectId(userId) }, { isPublic: setPublish });
    const { _id: id, userId: resultUserId, name, type, isPublic, parentId } = updatedFile;

    return { error: null, code: 200, updatedFile: { id, userId: resultUserId, name, type, isPublic, parentId } };
  },

  /**
   * Transforms a file document by changing _id to id and removing localPath.
   * @param {object} doc - The document to transform.
   * @returns {object} - The transformed file document.
   */
  transformFileDocument(doc) {
    const file = { id: doc._id, ...doc };
    delete file.localPath;
    delete file._id;
    return file;
  },

  /**
   * Checks if a file is public and belongs to a specific user.
   * @param {object} file - The file to check.
   * @param {string} userId - The ID of the user to check ownership.
   * @returns {boolean} - Whether the file is public and owned by the user.
   */
  isFilePublicAndOwnedByUser(file, userId) {
    return (file.isPublic || file.userId.toString() === userId);
  },

  /**
   * Retrieves file data from disk.
   * @param {object} file - The file document.
   * @param {string} size - The size for images (optional).
   * @returns {object} - Object containing file data or error message.
   */
  async getFileData(file, size) {
    let { localPath } = file;
    if (size) localPath = `${localPath}_${size}`;

    try {
      const data = await fsPromises.readFile(localPath);
      return { data };
    } catch (err) {
      return { error: 'File not found', code: 404 };
    }
  },
};

export default fileUtils;
