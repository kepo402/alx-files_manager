import { expect, use, should, request } from 'chai';
import chaiHttp from 'chai-http';
import { ObjectId } from 'mongodb';
import { exec } from 'child_process';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

use(chaiHttp);
should();

describe('File Endpoints Testing', () => {
  const credentials = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
  let token = '';
  let userId = '';
  let fileId = '';
  let parentId = '';

  const user = {
    email: 'bob@dylan.com',
    password: 'toto1234!',
  };

  before(async () => {
    await redisClient.client.flushall('ASYNC');
    await dbClient.usersCollection.deleteMany({});
    await dbClient.filesCollection.deleteMany({});
    let response = await request(app).post('/users').send(user);
    let body = JSON.parse(response.text);
    userId = body.id;

    response = await request(app).get('/connect').set('Authorization', credentials).send();
    body = JSON.parse(response.text);
    token = body.token;
  });

  after(async () => {
    await redisClient.client.flushall('ASYNC');
    await dbClient.usersCollection.deleteMany({});
    await dbClient.filesCollection.deleteMany({});
    exec('rm -rf /tmp/files_manager', (error) => {
      if (error) return;
    });
  });

  describe('POST /files', () => {
    it('returns error due to missing user Token', async () => {
      const fileInfo = {
        name: 'myText.txt',
        type: 'file',
        data: 'SGVsbG8gV2Vic3RhY2shCg==',
      };
      const response = await request(app).post('/files').send(fileInfo);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Unauthorized' });
      expect(response.statusCode).to.equal(401);
    });

    it('returns error due to missing name', async () => {
      const fileInfo = {
        type: 'file',
        data: 'SGVsbG8gV2Vic3RhY2shCg==',
      };
      const response = await request(app).post('/files').set('X-Token', token).send(fileInfo);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing name' });
      expect(response.statusCode).to.equal(400);
    });

    it('returns error due to missing type', async () => {
      const fileInfo = {
        name: 'myText.txt',
        data: 'SGVsbG8gV2Vic3RhY2shCg==',
      };
      const response = await request(app).post('/files').set('X-Token', token).send(fileInfo);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing type' });
      expect(response.statusCode).to.equal(400);
    });

    it('returns error due to wrong type', async () => {
      const fileInfo = {
        name: 'myText.txt',
        type: 'video',
        data: 'SGVsbG8gV2Vic3RhY2shCg==',
      };
      const response = await request(app).post('/files').set('X-Token', token).send(fileInfo);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing type' });
      expect(response.statusCode).to.equal(400);
    });

    it('returns error due to missing data and not being a folder', async () => {
      const fileInfo = {
        name: 'myText.txt',
        type: 'file',
      };
      const response = await request(app).post('/files').set('X-Token', token).send(fileInfo);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing data' });
      expect(response.statusCode).to.equal(400);
    });

    it('returns created file without isPublic or parentId', async () => {
      const fileInfo = {
        name: 'myText.txt',
        type: 'file',
        data: 'SGVsbG8gV2Vic3RhY2shCg==',
      };
      const response = await request(app).post('/files').set('X-Token', token).send(fileInfo);
      const body = JSON.parse(response.text);
      expect(body.userId).to.equal(userId);
      expect(body.name).to.equal(fileInfo.name);
      expect(body.type).to.equal(fileInfo.type);
      expect(body.isPublic).to.equal(false);
      expect(body.parentId).to.equal(0);
      expect(body).to.have.property('id');
      expect(response.statusCode).to.equal(201);

      fileId = body.id;
      const fileMongo = await dbClient.filesCollection.findOne({
        _id: ObjectId(body.id),
      });
      expect(fileMongo).to.exist;
      expect(fileMongo.localPath).to.exist;
    });

    it('returns created file with isPublic true', async () => {
      const fileInfo = {
        name: 'myText.txt',
        type: 'file',
        data: 'SGVsbG8gV2Vic3RhY2shCg==',
        isPublic: true,
      };
      const response = await request(app).post('/files').set('X-Token', token).send(fileInfo);
      const body = JSON.parse(response.text);
      expect(body.userId).to.equal(userId);
      expect(body.name).to.equal(fileInfo.name);
      expect(body.type).to.equal(fileInfo.type);
      expect(body.isPublic).to.equal(true);
      expect(body.parentId).to.equal(0);
      expect(body).to.have.property('id');
      expect(response.statusCode).to.equal(201);

      const fileMongo = await dbClient.filesCollection.findOne({
        _id: ObjectId(body.id),
      });
      expect(fileMongo).to.exist;
      expect(fileMongo.localPath).to.exist;
    });

    it('returns created folder', async () => {
      const fileInfo = {
        name: 'images',
        type: 'folder',
      };
      const response = await request(app).post('/files').set('X-Token', token).send(fileInfo);
      const body = JSON.parse(response.text);
      expect(body.userId).to.equal(userId);
      expect(body.name).to.equal(fileInfo.name);
      expect(body.type).to.equal(fileInfo.type);
      expect(body.isPublic).to.equal(false);
      expect(body.parentId).to.equal(0);
      expect(body).to.have.property('id');
      expect(response.statusCode).to.equal(201);

      parentId = body.id;
      const folderMongo = await dbClient.filesCollection.findOne({
        _id: ObjectId(body.id),
      });
      expect(folderMongo).to.exist;
      expect(folderMongo.localPath).to.not.exist;
    });

    it('returns error due to non-existent parentId', async () => {
      const fileInfo = {
        name: 'myText.txt',
        type: 'file',
        data: 'SGVsbG8gV2Vic3RhY2shCg==',
        parentId: '5f1e7cda04a394508232559d',
      };
      const response = await request(app).post('/files').set('X-Token', token).send(fileInfo);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Parent not found' });
      expect(response.statusCode).to.equal(400);
    });

    it('returns error if parentId is not a folder', async () => {
      const fileInfo = {
        name: 'myText.txt',
        type: 'file',
        data: 'SGVsbG8gV2Vic3RhY2shCg==',
        parentId: fileId,
      };
      const response = await request(app).post('/files').set('X-Token', token).send(fileInfo);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Parent is not a folder' });
      expect(response.statusCode).to.equal(400);
    });

    it('returns created file with tied parentId', async () => {
      const fileInfo = {
        name: 'myText.txt',
        type: 'file',
        data: 'SGVsbG8gV2Vic3RhY2shCg==',
        parentId,
      };
      const response = await request(app).post('/files').set('X-Token', token).send(fileInfo);
      const body = JSON.parse(response.text);
      expect(body.userId).to.equal(userId);
      expect(body.name).to.equal(fileInfo.name);
      expect(body.type).to.equal(fileInfo.type);
      expect(body.isPublic).to.equal(false);
      expect(body.parentId).to.equal(parentId);
      expect(body).to.have.property('id');
      expect(response.statusCode).to.equal(201);

      fileId = body.id;
      const fileMongo = await dbClient.filesCollection.findOne({
        _id: ObjectId(body.id),
      });
      expect(fileMongo).to.exist;
    });
  });

  describe('GET /files/:id', () => {
    it('returns unauthorized due to non-existent user', async () => {
      const response = await request(app).get(`/files/${fileId}`).set('X-Token', 'invalidToken');
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Unauthorized' });
      expect(response.statusCode).to.equal(401);
    });

    it('returns file data by valid id', async () => {
      const response = await request(app).get(`/files/${fileId}`).set('X-Token', token);
      const body = JSON.parse(response.text);
      expect(body).to.eql({
        id: fileId,
        userId,
        name: 'myText.txt',
        type: 'file',
        isPublic: false,
        parentId,
      });
      expect(response.statusCode).to.equal(200);
    });

    it('returns not found for invalid fileId', async () => {
      const response = await request(app).get(`/files/invalidId`).set('X-Token', token);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'File not found' });
      expect(response.statusCode).to.equal(404);
    });
  });
});
