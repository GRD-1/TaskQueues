import Bull from 'bull';
import net from 'net';
import config from 'config';
import { Account, Data } from '../models/max-balance.model';
import setTimer from '../utils/timer';
import getMaxAccount from '../utils/get-max-account';
import { EtherscanService } from './etherscan.service';
const etherscan = new EtherscanService();

export class BullService {
  downloadQueue: Bull.Queue;
  processQueue: Bull.Queue;

  constructor(public blocksAmount: number, public lastBlock: string) {
    const queueSettings = {
      redis: config.REDIS,
      defaultJobOptions: config.BULL.JOB_OPTIONS,
      settings: config.BULL.SETTINGS,
      limiter: config.BULL.LIMITER,
    };
    this.downloadQueue = new Bull('downloadQueue', queueSettings);
    this.processQueue = new Bull('processQueue', queueSettings);
  }

  async getMaxChangedBalance(): Promise<Data> {
    if (await this.isRedisUnavailable()) return { error: new Error('Error connecting to Redis!') };
    const result = await new Promise((resolve) => {
      (async (): Promise<void> => {
        const errMsg = await setTimer(this.blocksAmount * config.WAITING_TIME_FOR_BLOCK);
        resolve(errMsg);
      })();

      (async (): Promise<void> => {
        const loadingTime = await this.downloadData();
        const data = await this.processData();
        resolve({ ...data, loadingTime });
      })();
    });
    this.cleanQueue();
    return result;
  }

  downloadData(): Promise<number> {
    const lastBlockNumberDecimal = parseInt(this.lastBlock, 16);
    let i = 0;

    return new Promise((resolve) => {
      const startTime = Date.now();
      this.downloadQueue.on('completed', async () => {
        const jobs = await this.downloadQueue.getJobs(['completed']);
        if (jobs.length >= this.blocksAmount) resolve((Date.now() - startTime) / 1000);
      });
      this.downloadQueue.add('downloadBlocks', {}, { repeat: { every: 200, limit: this.blocksAmount } });
      this.downloadQueue.process('downloadBlocks', async (job, done) => {
        try {
          ++i;
          if (config.LOG_BENCHMARKS === true) console.log(`\ndownload queue iteration ${i}`);
          const blockNumberHex = (lastBlockNumberDecimal - i).toString(16);
          const block = await etherscan.getBlock(blockNumberHex);
          await this.processQueue.add('processBlocks', { block });
          const err = 'status' in block || 'error' in block ? Error(JSON.stringify(block.result)) : null;
          done(err);
        } catch (e) {
          console.error('downloadBlocks Error!', e);
          done(e);
        }
      });
    });
  }

  async processData(): Promise<Data> {
    const startTime = Date.now();
    let addressBalances: Account = { '': 0 };
    let maxAccount: Account = { '': 0 };
    let i = 0;
    let amountOfTransactions = 0;

    await new Promise((resolve) => {
      this.processQueue.on('completed', async () => {
        const jobs = await this.processQueue.getJobs(['completed']);
        if (jobs.length >= this.blocksAmount) resolve(null);
      });

      this.processQueue.process('processBlocks', async (job, done) => {
        i++;
        if (config.LOG_BENCHMARKS === true) console.log(`\nprocess queue iteration ${i}`);
        const { transactions } = job.data.block.result;
        addressBalances = transactions.reduce((accum, item) => {
          amountOfTransactions++;
          const val = Number(item.value);
          accum[item.to] = (accum[item.to] || 0) + val;
          accum[item.from] = (accum[item.from] || 0) - val;
          maxAccount = getMaxAccount({ [item.to]: accum[item.to] }, { [item.from]: accum[item.from] }, maxAccount);
          return accum;
        }, {});
        done();
      });
    });
    const processTime = (Date.now() - startTime) / 1000;
    return { addressBalances, maxAccount, amountOfTransactions, processTime };
  }

  async cleanQueue(): Promise<void> {
    await this.downloadQueue.obliterate({ force: true });
    await this.processQueue.obliterate({ force: true });
    await this.downloadQueue.close();
    await this.processQueue.close();
  }

  async isRedisUnavailable(): Promise<boolean> {
    const redisServerHost = config.REDIS.host;
    const redisServerPort = config.REDIS.port;
    const socket = net.createConnection(redisServerPort, redisServerHost);

    return new Promise((resolve) => {
      socket.on('connect', () => {
        socket.end();
        resolve(false);
      });

      socket.on('error', (error) => {
        resolve(true);
      });
    });
  }
}
