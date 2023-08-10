import { Connection, connect, Channel } from 'amqplib';
import config from 'config';
import {
  Data,
  Account,
  DownloadQueueFiller,
  QueueTaskArgs,
  DownloadWorkerArgs,
  ProcessWorkerArgs,
} from '../models/max-balance.model';
import fillTheQueue from '../utils/fill-the-queue';
import setTimer from '../utils/timer';
import getMaxAccount from '../utils/get-max-account';
import { EtherscanService } from './etherscan.service';
const etherscan = new EtherscanService();

export class RabbitmqService {
  private connection: Connection;
  private downloadChannel: Channel;
  private processChannel: Channel;
  readonly sessionKey: number;
  private addressBalances: Account;
  private maxAccount: Account = { undefined };
  private amountOfTransactions = 0;

  constructor(public blocksAmount: number, public lastBlock: string) {
    this.sessionKey = Date.now();
  }

  async getMaxChangedBalance(): Promise<Data> {
    try {
      await this.connectToServer();
      const result = await new Promise((resolve, reject) => {
        (async (): Promise<void> => {
          const errMsg = await setTimer(this.blocksAmount * config.WAITING_TIME_FOR_BLOCK);
          resolve(errMsg);
        })();
        (async (): Promise<void> => {
          try {
            const loadingTime = await this.downloadData();
            const processTime = await this.processData();
            resolve({
              addressBalances: this.addressBalances,
              maxAccount: this.maxAccount,
              amountOfTransactions: this.amountOfTransactions,
              processTime,
              loadingTime,
            });
          } catch (err) {
            reject(err);
          }
        })();
      });
      this.cleanQueue();
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  async connectToServer(): Promise<void | Error> {
    try {
      this.connection = await connect(`amqp://${config.RABBIT.host}`);
      this.downloadChannel = await this.connection.createChannel();
      this.processChannel = await this.connection.createChannel();
    } catch (err) {
      throw new Error('Error connecting to the RabbitMQ server!');
    }
  }

  async downloadData(): Promise<number> {
    try {
      const startTime = Date.now();
      await this.downloadChannel.assertQueue('downloadQueue', { durable: true });
      await this.downloadChannel.assertQueue('processQueue', { durable: true });

      const queueFiller: DownloadQueueFiller = (args: QueueTaskArgs) => {
        const terminateTask = args.taskNumber >= this.blocksAmount;
        const task = JSON.stringify({ ...args, terminateTask, sessionKey: this.sessionKey });
        this.downloadChannel.sendToQueue('downloadQueue', Buffer.from(task), { persistent: true });
      };
      fillTheQueue(queueFiller, this.lastBlock, this.blocksAmount);

      return new Promise((resolve, reject) => {
        this.downloadChannel.consume('downloadQueue', async (task) => {
          await this.downloadQueueWorker({ task, startTime, resolve, reject });
        });
      });
    } catch (err) {
      throw Error(`Error! Fail to download data! reason: ${err.message}`);
    }
  }

  async downloadQueueWorker(args: DownloadWorkerArgs): Promise<void> {
    const { task, startTime, resolve, reject } = args;
    const taskContent = task !== null ? JSON.parse(task.content) : null;
    if (taskContent !== null && taskContent.sessionKey === this.sessionKey) {
      if (config.LOG_BENCHMARKS === true) console.log(`\ndownload queue iteration ${taskContent.taskNumber}`);
      try {
        const block = await etherscan.getBlock(taskContent.blockNumberHex);
        const processQueueTask = JSON.stringify({ ...taskContent, content: block });
        await this.downloadChannel.sendToQueue('processQueue', Buffer.from(processQueueTask), {
          persistent: true,
        });
        this.downloadChannel.ack(task);
      } catch (e) {
        console.error('downloadBlocks Error!', e);
        reject(e);
      }
      if (taskContent?.terminateTask) {
        resolve((Date.now() - startTime) / 1000);
      }
    }
  }

  async processData(): Promise<number> {
    const startTime = Date.now();
    await new Promise((resolve, reject) => {
      this.processChannel.consume('processQueue', async (task) => {
        const taskContent = task !== null ? JSON.parse(task.content) : null;
        if (taskContent) {
          await this.processQueueWorker({ ...taskContent, startTime, resolve, reject });
        }
      });
    }).catch((err) => {
      throw Error(`Error! Fail to process data! reason: ${err.message}`);
    });
    return (Date.now() - startTime) / 1000;
  }

  async processQueueWorker(args: ProcessWorkerArgs): Promise<void> {
    const { taskNumber, sessionKey, terminateTask, content, startTime } = args;
    const { taskCallback, resolve, reject } = args;
    if (content && sessionKey === this.sessionKey) {
      if (config.LOG_BENCHMARKS === true) console.log(`\nprocess queue iteration ${taskNumber}`);
      try {
        const transactions = content?.result?.transactions;
        if (transactions) {
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
        }
      } catch (e) {
        if (taskCallback) taskCallback(e);
        if (reject) reject(e);
      }
      if (taskCallback) taskCallback(null);
      if (terminateTask) {
        if (resolve) resolve((Date.now() - startTime) / 1000);
      }
    }
  }

  async cleanQueue(): Promise<void> {
    try {
      await this.downloadChannel.deleteQueue('downloadQueue');
      await this.downloadChannel.deleteQueue('processQueue');
      this.connection.close();
    } catch (err) {
      throw Error(`Error! Fail to close the connection! reason: ${err.message}`);
    }
  }
}
