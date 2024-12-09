import { expect, use, should, request } from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';
import dbClient from '../utils/db';

use(chaiHttp);
should();

describe('Testing App Endpoints', () => {
  
  // Test Status Endpoints
  describe('GET /status', () => {
    it('should return the status of Redis and MongoDB connection', async () => {
      const response = await request(app).get('/status').send();
      const body = JSON.parse(response.text);

      expect(body).to.eql({ redis: true, db: true });
      expect(response.statusCode).to.equal(200);
    });
  });

  // Test Stats Endpoint
  describe('GET /stats', () => {
    beforeEach(async () => {
      await clearDb();
    });

    it('should return number of users and files as 0 initially', async () => {
      const response = await request(app).get('/stats').send();
      const body = JSON.parse(response.text);

      expect(body).to.eql({ users: 0, files: 0 });
      expect(response.statusCode).to.equal(200);
    });

    it('should return the correct number of users and files after insertion', async () => {
      await insertTestData();

      const response = await request(app).get('/stats').send();
      const body = JSON.parse(response.text);

      expect(body).to.eql({ users: 1, files: 2 });
      expect(response.statusCode).to.equal(200);
    });
  });
});

/**
 * Helper function to clear the database collections.
 */
async function clearDb() {
  await dbClient.usersCollection.deleteMany({});
  await dbClient.filesCollection.deleteMany({});
}

/**
 * Helper function to insert test data into the database.
 */
async function insertTestData() {
  await dbClient.usersCollection.insertOne({ name: 'Larry' });
  await dbClient.filesCollection.insertOne({ name: 'image.png' });
  await dbClient.filesCollection.insertOne({ name: 'file.txt' });
}

