import { expect, use, should } from 'chai';
import chaiHttp from 'chai-http';
import { promisify } from 'util';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

use(chaiHttp);
should();

describe('Testing the clients for MongoDB and Redis', () => {
  
  // Redis Client Tests
  describe('redis Client', () => {
    beforeEach(async () => {
      await clearRedis();
    });

    afterEach(async () => {
      await clearRedis();
    });

    it('should show that connection is alive', async () => {
      expect(redisClient.isAlive()).to.equal(true);
    });

    it('should return null for non-existing key', async () => {
      expect(await redisClient.get('myKey')).to.equal(null);
    });

    it('should allow setting a key without issues', async () => {
      expect(await redisClient.set('myKey', 12, 1)).to.equal(undefined);
    });

    it('should return null for expired key', async () => {
      const sleep = promisify(setTimeout);
      await sleep(1100);
      expect(await redisClient.get('myKey')).to.equal(null);
    });
  });

  // Database Client Tests
  describe('db Client', () => {
    beforeEach(async () => {
      await clearDb();
    });

    afterEach(async () => {
      await clearDb();
    });

    it('should show that connection is alive', () => {
      expect(dbClient.isAlive()).to.equal(true);
    });

    it('should return the correct number of user documents', async () => {
      await dbClient.usersCollection.deleteMany({});
      expect(await dbClient.nbUsers()).to.equal(0);

      await dbClient.usersCollection.insertOne({ name: 'Larry' });
      await dbClient.usersCollection.insertOne({ name: 'Karla' });
      expect(await dbClient.nbUsers()).to.equal(2);
    });

    it('should return the correct number of file documents', async () => {
      await dbClient.filesCollection.deleteMany({});
      expect(await dbClient.nbFiles()).to.equal(0);

      await dbClient.filesCollection.insertOne({ name: 'FileOne' });
      await dbClient.filesCollection.insertOne({ name: 'FileTwo' });
      expect(await dbClient.nbFiles()).to.equal(2);
    });
  });
});

/**
 * Helper function to clear Redis cache.
 */
async function clearRedis() {
  await redisClient.client.flushall('ASYNC');
}

/**
 * Helper function to clear DB collections.
 */
async function clearDb() {
  await dbClient.usersCollection.deleteMany({});
  await dbClient.filesCollection.deleteMany({});
}

