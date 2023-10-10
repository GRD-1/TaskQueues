import config from 'config';
import * as path from 'path';
import { agent } from 'supertest';
import { app } from '../../../app';
jest.mock('config');

describe('integration test of routes', () => {
  beforeAll(() => {
    config.PROJECT_ROOT = path.resolve(process.cwd());
  });

  describe('GET the max-balance page', () => {
    const expectedStrings = ['0x10b2feb', '0xb266c754808c963d8b37c938e0985414c6fd2aa1', '21151000000000000000', '356'];

    describe('default parameters', () => {
      it('should return an html page with the correct values', async () => {
        console.log('default parameters');
        const result = await agent(app).get('/max-balance');

        expect(result.status).toEqual(200);
        expect(result.text).toContain('fastq');
        expectedStrings.forEach((expectedString) => {
          expect(result.text).toContain(expectedString);
        });
      });

      it('should return an html page with the correct values', async () => {
        console.log('default parameters + lastBLock');
        const result = await agent(app).get('/max-balance?lastBlock=last');

        expect(result.status).toEqual(200);
      });

      it('should return an html page with the correct values', async () => {
        console.log('default parameters + blocksAmount');
        const result = await agent(app).get('/max-balance?blocksAmount=4');

        expect(result.status).toEqual(200);
      });

      it('should return an error', async () => {
        console.log('default parameters + wrong library name');
        const result = await agent(app).get('/max-balance?library=wrongLibraryName');

        expect(result.status).toEqual(200);
        expect(result.text).toContain('incorrect library name!');
      });

      it('should return an error', async () => {
        console.log('default parameters + wrong amount of blocks');
        const result = await agent(app).get('/max-balance?blocksAmount=333');

        expect(result.status).toEqual(200);
        expect(result.text).toContain('too much blocks!');
      });
    });

    describe('fastq library', () => {
      it('should return an html page with the correct values', async () => {
        console.log('fastq library');
        const result = await agent(app).get('/max-balance?library=fastq');

        expect(result.status).toEqual(200);
        expect(result.text).toContain('fastq');
        expectedStrings.forEach((expectedString) => {
          expect(result.text).toContain(expectedString);
        });
      });
    });

    describe('bull library', () => {
      it('should return an html page with the correct values', async () => {
        console.log('bull library');
        const result = await agent(app).get('/max-balance?library=bull');

        expect(result.status).toEqual(200);
        expect(result.text).toContain('bull');
        expectedStrings.forEach((expectedString) => {
          expect(result.text).toContain(expectedString);
        });
      });
    });

    describe('rabbitmq library', () => {
      it('should return an html page with the correct values', async () => {
        console.log('rabbitmq library');
        const result = await agent(app).get('/max-balance?library=rabbitmq');

        expect(result.status).toEqual(200);
        expect(result.text).toContain('rabbitmq');
        expectedStrings.forEach((expectedString) => {
          expect(result.text).toContain(expectedString);
        });
      });
    });
  });
});
