import { Connection, connect, Channel } from 'amqplib';
import config from 'config';
import { DownloadQueueFiller, QueueTaskArgs, DownloadWorkerArgs } from '../models/max-balance.model';
import { Service } from './service';
import { EtherscanService } from './etherscan.service';
const etherscan = new EtherscanService();

export class RabbitmqService extends Service {
  private connection: Connection;
  private downloadChannel: Channel;
  private processChannel: Channel;

  async connectToServer(): Promise<void> {
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
      this.fillTheQueue(queueFiller, this.lastBlock, this.blocksAmount);

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
        if (taskContent?.terminateTask) {
          resolve((Date.now() - startTime) / 1000);
        }
      } catch (e) {
        reject(e);
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

  async cleanQueue(): Promise<void> {
    try {
      await this.downloadChannel.deleteQueue('downloadQueue');
      await this.downloadChannel.deleteQueue('processQueue');
      await this.downloadChannel.close();
      await this.processChannel.close();
      this.connection.close();
    } catch (err) {
      throw Error(`Error! Fail to close the connection! reason: ${err.message}`);
    }
  }
}
