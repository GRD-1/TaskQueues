import { Connection, connect, Channel } from 'amqplib';
import config from 'config';
import { Data, Account, DownloadQueueFiller, QueueTaskArgs, QueueWorkerArgs } from '../models/max-balance.model';
import scheduleDownloads from '../utils/schedule-downloads';
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
      scheduleDownloads(queueFiller, this.lastBlock, this.blocksAmount);

      return new Promise((resolve, reject) => {
        this.downloadChannel.consume('downloadQueue', async (task) => {
          await this.downloadQueueWorker({ task, startTime, resolve, reject });
        });
      });
    } catch (error) {
      console.error('Error occurred while downloading data:', error.message);
      throw error;
    }
  }

  async downloadQueueWorker(args: QueueWorkerArgs): Promise<void> {
    const { task, startTime, resolve, reject } = args;
    const taskContent = task !== null ? JSON.parse(task.content.toString()) : null;
    if (taskContent !== null && taskContent.sessionKey === this.sessionKey) {
      if (config.LOG_BENCHMARKS === true) console.log(`\ndownload queue iteration ${taskContent.taskNumber}`);
      try {
        const block = await etherscan.getBlock(taskContent.blockNumberHex);
        const dataProcessTask = JSON.stringify({ ...taskContent, content: block });
        await this.downloadChannel.sendToQueue('processQueue', Buffer.from(dataProcessTask), {
          persistent: true,
        });
        this.downloadChannel.ack(task);
      } catch (e) {
        console.error('downloadBlocks Error!', e);
        reject(e);
      }
      if (taskContent?.terminateTask) {
        this.downloadChannel.deleteQueue('downloadQueue');
        resolve((Date.now() - startTime) / 1000);
      }
    }
  }

  async processData(): Promise<number> {
    try {
      const startTime = Date.now();
      return new Promise((resolve, reject) => {
        this.processChannel.consume('processQueue', async (task) => {
          await this.processQueueWorker({ task, startTime, resolve, reject });
        });
      });
    } catch (error) {
      console.error('Error occurred while downloading data:', error.message);
      throw error;
    }
  }

  async processQueueWorker(args: QueueWorkerArgs): Promise<void> {
    const { task, startTime, resolve, reject } = args;
    const taskContent = task !== null ? JSON.parse(task.content.toString()) : null;
    if (taskContent !== null && taskContent.sessionKey === this.sessionKey) {
      if (config.LOG_BENCHMARKS === true) console.log(`\nprocess queue iteration ${taskContent.taskNumber}`);
      try {
        const { transactions } = taskContent.content.result;
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
        console.error('processBlocks Error!', e);
        reject(e);
      }
      await this.processChannel.ack(task);
      if (taskContent?.terminateTask) {
        await this.processChannel.deleteQueue('processQueue');
        resolve((Date.now() - startTime) / 1000);
      }
    }
  }

  async cleanQueue(): Promise<void> {
    try {
      await this.downloadChannel.deleteQueue('downloadQueue');
      await this.downloadChannel.deleteQueue('processQueue');
      this.connection.close();
    } catch (error) {
      console.error('Error occurred while deleting the queue:', error.message);
    }
  }
}