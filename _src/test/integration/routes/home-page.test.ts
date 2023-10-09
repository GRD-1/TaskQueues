import config from 'config';
import * as path from 'path';
import { agent } from 'supertest';
import { app } from '../../../app';
jest.mock('config');

describe('integration test of routes', () => {
  beforeAll(() => {
    const projectRoot = path.resolve(process.cwd());
    config.PROJECT_ROOT = projectRoot;
  });

  describe('GET the root page', () => {
    it('should return the correct status', async () => {
      const result = await agent(app).get('/');

      expect(result.status).toEqual(302);
    });
  });

  describe('GET the home page', () => {
    it('should return the correct html page', async () => {
      const result = await agent(app).get('/home');

      expect(result.status).toEqual(200);
      expect(result.text.length).toEqual(2884);
    });
  });
});
