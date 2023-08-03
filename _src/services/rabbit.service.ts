import { Connection, connect, Channel } from 'amqplib';
import config from 'config';
import { Data, Account, DownloadQueueFiller } from '../models/max-balance.model';
import scheduleDownloads from '../utils/schedule-downloads';
import setTimer from '../utils/timer';
import getMaxAccount from '../utils/get-max-account';
import { EtherscanService } from './etherscan.service';
const etherscan = new EtherscanService();

export class RabbitService {
  private connection: Connection;
  private connectionChannel: Channel;

  constructor(public blocksAmount: number, public lastBlock: string) {}

  async getMaxChangedBalance(): Promise<Data> {
    const connection = await this.connectToRabbitMQ();
    if (!connection) return { error: new Error('Error connecting to RabbitMQ!') };
    const result = await new Promise((resolve) => {
      (async (): Promise<void> => {
        const errMsg = await setTimer(this.blocksAmount * config.WAITING_TIME_FOR_BLOCK);
        resolve(errMsg);
      })();

      (async (): Promise<void> => {
        const loadingTime = await this.downloadData();
        const data = await this.processData();
        // const data = {};
        resolve({ ...data, loadingTime });
      })();
    });
    this.cleanQueue();
    return result;
  }

  async downloadData(): Promise<number> {
    try {
      const startTime = Date.now();
      const lastBlockNumberDecimal = parseInt(this.lastBlock, 16);
      let i = 0;

      await this.connectionChannel.assertQueue('downloadQueue', { durable: true });
      await this.connectionChannel.assertQueue('processQueue', { durable: true });
      await this.connectionChannel.assertQueue('valory', { durable: true });
      await this.connectionChannel.assertQueue('latepia', { durable: true });
      await this.connectionChannel.assertQueue('telapia', { durable: true });

      const queueFiller: DownloadQueueFiller = async (blockNumberHex: string) => {
        await this.connectionChannel.sendToQueue('downloadQueue', Buffer.from(blockNumberHex), { persistent: true });
      };
      await scheduleDownloads(queueFiller, this.lastBlock, this.blocksAmount);

      return new Promise((resolve) => {
        this.connectionChannel.consume('downloadQueue', async (message) => {
          if (message !== null) {
            if (config.LOG_BENCHMARKS === true) console.log(`\ndownload queue iteration ${i}`);
            try {
              ++i;
              const blockNumberHex = (lastBlockNumberDecimal - i).toString(16);
              const block = await etherscan.getBlock(blockNumberHex);
              await this.connectionChannel.sendToQueue('processQueue', Buffer.from(JSON.stringify(block)), {
                persistent: true,
              });
              const err = 'status' in block || 'error' in block ? Error(JSON.stringify(block.result)) : null;
            } catch (e) {
              console.error('downloadBlocks Error!', e);
            }
            await this.connectionChannel.ack(message);
          } else {
            console.log('downloadQueue is drained.');
            resolve((Date.now() - startTime) / 1000);
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
    let i = 0;
    let amountOfTransactions = 0;

    await new Promise((resolve) => {
      this.connectionChannel.consume('processQueue', async (message) => {
        if (message !== null) {
          try {
            i++;
            if (config.LOG_BENCHMARKS === true) console.log(`\nprocess queue iteration ${i}`);
            const { transactions } = message.data.block.result;
            addressBalances = transactions.reduce((accum, item) => {
              amountOfTransactions++;
              const val = Number(item.value);
              accum[item.to] = (accum[item.to] || 0) + val;
              accum[item.from] = (accum[item.from] || 0) - val;
              maxAccount = getMaxAccount({ [item.to]: accum[item.to] }, { [item.from]: accum[item.from] }, maxAccount);
              return accum;
            }, {});
          } catch (e) {
            console.error('downloadBlocks Error!', e);
          }
          await this.connectionChannel.ack(message);
        } else {
          console.log('downloadQueue is drained.');
          resolve((Date.now() - startTime) / 1000);
        }
      });
    });
    const processTime = (Date.now() - startTime) / 1000;
    return { addressBalances, maxAccount, amountOfTransactions, processTime };
  }

  async cleanQueue(): Promise<void> {
    try {
      console.log('\ncleanQueue');
      await this.connectionChannel.deleteQueue('downloadQueue');
      // await this.connectionChannel.deleteQueue('processQueue');
      await this.connectionChannel.close();
      await this.connection.close();
      process.exit(0);
    } catch (error) {
      console.error('Error occurred while deleting the queue:', error.message);
    }
  }

  async connectToRabbitMQ(): Promise<boolean> {
    try {
      this.connection = await connect(`amqp://${config.RABBIT.host}`);
      this.connectionChannel = await this.connection.createChannel();
      return true;
    } catch (error) {
      return false;
    }
  }
}
