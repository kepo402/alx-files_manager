import { expect, use, should, request } from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { ObjectId } from 'mongodb';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

use(chaiHttp);
should();

describe('Testing User Endpoints', () => {
  const credentials = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
  let token = '';
  let userId = '';
  const user = {
    email: 'bob@dylan.com',
    password: 'toto1234!',
  };

  beforeEach(async () => {
    await clearDb();
    await redisClient.client.flushall('ASYNC');
  });

  afterEach(async () => {
    await clearDb();
    await redisClient.client.flushall('ASYNC');
  });

  // User Registration Endpoints
  describe('POST /users', () => {
    it('should create a new user and return the user details', async () => {
      const response = await createUser(user);
      const body = JSON.parse(response.text);

      expect(body.email).to.equal(user.email);
      expect(body).to.have.property('id');
      expect(response.statusCode).to.equal(201);

      userId = body.id;
      const userMongo = await dbClient.usersCollection.findOne({
        _id: ObjectId(body.id),
      });
      expect(userMongo).to.exist;
    });

    it('should return an error when password is missing', async () => {
      const response = await createUser({ email: user.email });
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing password' });
      expect(response.statusCode).to.equal(400);
    });

    it('should return an error when email is missing', async () => {
      const response = await createUser({ password: user.password });
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing email' });
      expect(response.statusCode).to.equal(400);
    });

    it('should return an error when user already exists', async () => {
      await createUser(user);
      const response = await createUser(user);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Already exist' });
      expect(response.statusCode).to.equal(400);
    });
  });

  // User Connection (Login)
  describe('GET /connect', () => {
    it('should return unauthorized error if credentials are incorrect', async () => {
      const response = await request(app).get('/connect').send();
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Unauthorized' });
      expect(response.statusCode).to.equal(401);
    });

    it('should return a token for valid credentials', async () => {
      const spyRedisSet = sinon.spy(redisClient, 'set');

      const response = await request(app)
        .get('/connect')
        .set('Authorization', credentials)
        .send();
      const body = JSON.parse(response.text);
      token = body.token;

      expect(body).to.have.property('token');
      expect(response.statusCode).to.equal(200);
      expect(
        spyRedisSet.calledOnceWithExactly(`auth_${token}`, userId, 24 * 3600)
      ).to.be.true;

      spyRedisSet.restore();
    });

    it('should verify that the token exists in Redis', async () => {
      const redisToken = await redisClient.get(`auth_${token}`);
      expect(redisToken).to.exist;
    });
  });

  // User Disconnection (Logout)
  describe('GET /disconnect', () => {
    it('should return unauthorized error if no token is provided', async () => {
      const response = await request(app).get('/disconnect').send();
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Unauthorized' });
      expect(response.statusCode).to.equal(401);
    });

    it('should sign out the user based on the token', async () => {
      const response = await request(app)
        .get('/disconnect')
        .set('X-Token', token)
        .send();
      expect(response.text).to.be.equal('');
      expect(response.statusCode).to.equal(204);
    });

    it('should verify that the token no longer exists in Redis', async () => {
      const redisToken = await redisClient.get(`auth_${token}`);
      expect(redisToken).to.not.exist;
    });
  });

  // Get Current User Details
  describe('GET /users/me', () => {
    beforeEach(async () => {
      const response = await request(app)
        .get('/connect')
        .set('Authorization', credentials)
        .send();
      const body = JSON.parse(response.text);
      token = body.token;
    });

    it('should return unauthorized error if no token is provided', async () => {
      const response = await request(app).get('/users/me').send();
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Unauthorized' });
      expect(response.statusCode).to.equal(401);
    });

    it('should return user details based on the token', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('X-Token', token)
        .send();
      const body = JSON.parse(response.text);
      expect(body).to.eql({ id: userId, email: user.email });
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
 * Helper function to create a new user.
 */
async function createUser(userData) {
  return await request(app).post('/users').send(userData);
}

