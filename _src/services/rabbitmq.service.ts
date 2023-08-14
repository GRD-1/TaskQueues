import { Connection, connect, Channel } from 'amqplib';
import config from 'config';
import { QueueTaskArgs, DownloadWorkerArgs } from '../models/max-balance.model';
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
    } catch (e) {
      e.message = 'Error! Failed to connect to the RabbitMQ server!';
      globalThis.ERROR_EMITTER.emit('Error', e);
    }
  }

  async downloadData(): Promise<number> {
    await super.downloadData();
    try {
      const startTime = Date.now();
      await this.downloadChannel.assertQueue('downloadQueue', { durable: true });
      await this.downloadChannel.assertQueue('processQueue', { durable: true });

      const queueFiller = (args: QueueTaskArgs): void => {
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
    } catch (e) {
      e.message = `Error! Fail to download data! reason: ${e.message}`;
      globalThis.ERROR_EMITTER.emit('Error', e);
      return null;
    }
  }

  async downloadQueueWorker(args: DownloadWorkerArgs): Promise<void> {
    const { task, startTime, resolve, reject } = args;
    const taskContent = task !== null ? JSON.parse(task.content) : null;
    if (taskContent !== null && taskContent.sessionKey === this.sessionKey) {
      if (config.LOG_BENCHMARKS === true) console.log(`\ndownload queue iteration ${taskContent.taskNumber}`);
      this.numberOfProcessedTasks++;
      try {
        const block = await etherscan.getBlock(taskContent.blockNumberHex);
        const processQueueTask = JSON.stringify({ ...taskContent, content: block });
        await this.downloadChannel.sendToQueue('processQueue', Buffer.from(processQueueTask), {
          persistent: true,
        });
        this.downloadChannel.ack(task);
        if (this.numberOfProcessedTasks >= this.blocksAmount) {
          resolve((Date.now() - startTime) / 1000);
        }
      } catch (e) {
        reject(e);
      }
    }
  }

  async processData(): Promise<number> {
    await super.processData();
    const startTime = Date.now();
    await new Promise((resolve, reject) => {
      this.processChannel.consume('processQueue', async (task) => {
        const taskContent = task !== null ? JSON.parse(task.content) : null;
        if (taskContent) {
          await this.processQueueWorker({ ...taskContent, startTime, resolve, reject });
        }
      });
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
    } catch (e) {
      e.message = `Error! Fail to close the connection! reason: ${e.message}`;
      globalThis.ERROR_EMITTER.emit('Error', e);
    }
  }
}
