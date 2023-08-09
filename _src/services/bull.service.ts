import Bull from 'bull';
import net from 'net';
import config from 'config';
import { Account, Block, Data, DownloadQueueFiller, QueueTaskArgs, QueueWorkerArgs } from '../models/max-balance.model';
import setTimer from '../utils/timer';
import getMaxAccount from '../utils/get-max-account';
import { EtherscanService } from './etherscan.service';
import scheduleDownloads from '../utils/schedule-downloads';
const etherscan = new EtherscanService();
const queueSettings = {
  redis: config.REDIS,
  defaultJobOptions: config.BULL.JOB_OPTIONS,
  settings: config.BULL.SETTINGS,
  limiter: config.BULL.LIMITER,
};

export class BullService {
  downloadQueue: Bull.Queue;
  processQueue: Bull.Queue;
  readonly sessionKey: number;
  private addressBalances: Account;
  private maxAccount: Account;
  private amountOfTransactions = 0;

  constructor(public blocksAmount: number, public lastBlock: string) {
    this.sessionKey = Date.now();
  }

  async getMaxChangedBalance(): Promise<Data> {
    try {
      await this.connectToServer();
      const result = await new Promise((resolve) => {
        (async (): Promise<void> => {
          const errMsg = await setTimer(this.blocksAmount * config.WAITING_TIME_FOR_BLOCK);
          resolve(errMsg);
        })();
        (async (): Promise<void> => {
          const loadingTime = await this.downloadData();
          const processTime = await this.processData();
          resolve({
            addressBalances: this.addressBalances,
            maxAccount: this.maxAccount,
            amountOfTransactions: this.amountOfTransactions,
            processTime,
            loadingTime,
          });
        })();
      });
      this.cleanQueue();
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  async connectToServer(): Promise<void | Error> {
    const redisServerHost = config.REDIS.host;
    const redisServerPort = config.REDIS.port;
    const socket = net.createConnection(redisServerPort, redisServerHost);

    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        socket.end();
        resolve();
      });

      socket.on('error', () => {
        reject(new Error('Error connecting to the Redis server!'));
      });
    });
  }

  downloadData(): Promise<number> {
    const startTime = Date.now();
    this.downloadQueue = new Bull('downloadQueue', queueSettings);
    this.processQueue = new Bull('processQueue', queueSettings);

    const queueFiller: DownloadQueueFiller = (args: QueueTaskArgs) => {
      const terminateTask = args.taskNumber >= this.blocksAmount;
      const task = JSON.stringify({ ...args, terminateTask, sessionKey: this.sessionKey });
      this.downloadQueue.add('downloadQueue', task, {});
    };
    scheduleDownloads(queueFiller, this.lastBlock, this.blocksAmount);

    return new Promise((resolve, reject) => {
      this.downloadQueue.process('downloadQueue', async (job, done) => {
        await this.downloadQueueWorker({ task: job, startTime, resolve, reject }, done);
      });
    });
  }

  async downloadQueueWorker(args: QueueWorkerArgs, callback: Bull.DoneCallback): Promise<void> {
    const { task, startTime, resolve, reject } = args;
    const taskContent = task !== null ? JSON.parse(task.data) : null;
    if (taskContent !== null && taskContent.sessionKey === this.sessionKey) {
      if (config.LOG_BENCHMARKS === true) console.log(`\ndownload queue iteration ${taskContent.taskNumber}`);
      try {
        const block = await etherscan.getBlock(taskContent.blockNumberHex);
        const processQueueTask = JSON.stringify({ ...taskContent, data: block });
        await this.processQueue.add('processQueue', processQueueTask);
      } catch (e) {
        console.error('downloadQueue Error!', e);
        callback(e);
        reject(e);
      }
      callback();
      if (taskContent?.terminateTask) {
        console.log('\ndownloadQueue is drained!');
        resolve((Date.now() - startTime) / 1000);
      }
    }
  }

  async processData(): Promise<number> {
    try {
      const startTime = Date.now();
      return new Promise((resolve, reject) => {
        this.processQueue.process('processQueue', async (job, done) => {
          await this.processQueueWorker({ task: job, startTime, resolve, reject }, done);
        });
      });
    } catch (error) {
      console.error('Error occurred while process data:', error.message);
      throw error;
    }
  }

  async processQueueWorker(args: QueueWorkerArgs, callback: Bull.DoneCallback): Promise<void> {
    const { task, startTime, resolve, reject } = args;
    const taskContent = task !== null ? JSON.parse(task.data) : null;
    if (taskContent !== null && taskContent.sessionKey === this.sessionKey) {
      if (config.LOG_BENCHMARKS === true) console.log(`\nprocess queue iteration ${taskContent.taskNumber}`);
      try {
        const { transactions } = taskContent.data.result;
        this.addressBalances = transactions.reduce((accum, item) => {
          this.amountOfTransactions++;
          const val = Number(item.value);
          accum[item.to] = (accum[item.to] || 0) + val;
          accum[item.from] = (accum[item.from] || 0) - val;
          this.maxAccount = getMaxAccount(
            { [item.to]: accum[item.to] },
            { [item.from]: accum[item.from] },
            this.maxAccount,
          );
          return accum;
        }, {});
      } catch (e) {
        console.error('processQueue Error!', e);
        callback(e);
        reject(e);
      }
      callback();
      if (taskContent?.terminateTask) {
        console.log('\nprocessQueue is drained!');
        resolve((Date.now() - startTime) / 1000);
      }
    }
  }

  async cleanQueue(): Promise<void> {
    await this.downloadQueue.obliterate({ force: true });
    await this.processQueue.obliterate({ force: true });
    await this.downloadQueue.close();
    await this.processQueue.close();
  }
}
