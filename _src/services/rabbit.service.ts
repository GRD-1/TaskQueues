import { Connection, connect, Channel } from 'amqplib';
import config from 'config';
import { Data, Account, DownloadQueueFiller, QueueTaskArgs } from '../models/max-balance.model';
import scheduleDownloads from '../utils/schedule-downloads';
import setTimer from '../utils/timer';
import getMaxAccount from '../utils/get-max-account';
import { EtherscanService } from './etherscan.service';
const etherscan = new EtherscanService();

export class RabbitService {
  private connection: Connection;
  private downloadChannel: Channel;
  private processChannel: Channel;
  private sessionKey: number;

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
          const data = await this.processData();
          resolve({ ...data, loadingTime });
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

      return new Promise((resolveDownload) => {
        this.downloadChannel.consume('downloadQueue', async (message) => {
          const msgContent = message !== null ? JSON.parse(message.content.toString()) : null;
          if (msgContent !== null && msgContent.sessionKey === this.sessionKey) {
            if (config.LOG_BENCHMARKS === true) console.log(`\ndownload queue iteration ${msgContent.taskNumber}`);
            try {
              const block = await etherscan.getBlock(msgContent.blockNumberHex);
              const task = JSON.stringify({ ...msgContent, content: block });
              await this.downloadChannel.sendToQueue('processQueue', Buffer.from(task), {
                persistent: true,
              });
              this.downloadChannel.ack(message);
            } catch (e) {
              console.error('downloadBlocks Error!', e);
            }
            if (msgContent?.terminateTask) {
              this.downloadChannel.deleteQueue('downloadQueue');
              resolveDownload((Date.now() - startTime) / 1000);
            }
          }
        });
      });
    } catch (error) {
      console.error('Error occurred while downloading data:', error.message);
      throw error;
    }
  }

  async processData(): Promise<Data> {
    const startTime = Date.now();
    let addressBalances: Account = { '': 0 };
    let maxAccount: Account = { '': 0 };
    let amountOfTransactions = 0;

    await new Promise<void>((resolve) => {
      this.processChannel.consume('processQueue', async (message) => {
        const msgContent = message !== null ? JSON.parse(message.content.toString()) : null;
        if (msgContent !== null && msgContent.sessionKey === this.sessionKey) {
          if (config.LOG_BENCHMARKS === true) console.log(`\nprocess queue iteration ${msgContent.taskNumber}`);
          try {
            const { transactions } = msgContent.content.result;
            addressBalances = transactions.reduce((accum, item) => {
              amountOfTransactions++;
              const val = Number(item.value);
              accum[item.to] = (accum[item.to] || 0) + val;
              accum[item.from] = (accum[item.from] || 0) - val;
              maxAccount = getMaxAccount({ [item.to]: accum[item.to] }, { [item.from]: accum[item.from] }, maxAccount);
              return accum;
            }, {});
          } catch (e) {
            console.error('processBlocks Error!', e);
          }
          await this.processChannel.ack(message);
          if (msgContent?.terminateTask) {
            await this.processChannel.deleteQueue('processQueue');
            resolve();
          }
        }
      });
    });
    const processTime = (Date.now() - startTime) / 1000;
    return { addressBalances, maxAccount, amountOfTransactions, processTime };
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
