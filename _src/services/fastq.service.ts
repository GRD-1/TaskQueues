import fastq from 'fastq';
import config from 'config';
import type { queue, done } from 'fastq';
import { QueueTaskArgs, DownloadQueueFiller } from '../models/max-balance.model';
import { Service } from './service';
import { EtherscanService } from './etherscan.service';
const etherscan = new EtherscanService();

export class FastqService extends Service {
  private downloadQueue: queue<QueueTaskArgs, fastq.done>;
  private processQueue: queue<QueueTaskArgs, fastq.done>;

  async downloadData(): Promise<number> {
    await super.downloadData();
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      this.downloadQueue = fastq((args: QueueTaskArgs, callback: done) => this.downloadQueueWorker(args, callback), 1);
      this.processQueue = fastq(async (args: QueueTaskArgs, callback: done) => {
        const dataProcessArgs = { ...args, startTime, taskCallback: callback };
        await this.processQueueWorker(dataProcessArgs);
      }, 1);
      this.processQueue.pause();

      const queueFiller: DownloadQueueFiller = (args: QueueTaskArgs) => {
        const terminateTask = args.taskNumber >= this.blocksAmount;
        const task = { ...args, terminateTask, sessionKey: this.sessionKey };
        const callback = (err): void => {
          if (err) {
            this.terminateAllProcesses = true;
            reject(err);
          }
        };
        this.downloadQueue.push(task, callback);
      };
      this.fillTheQueue(queueFiller, this.lastBlock, this.blocksAmount);

      this.downloadQueue.drain = (): void => {
        resolve((Date.now() - startTime) / 1000);
      };
    });
  }

  async downloadQueueWorker(args: QueueTaskArgs, callback: done): Promise<void> {
    try {
      if (config.LOG_BENCHMARKS === true) console.log(`\ndownload queue iteration ${args.taskNumber}`);
      const block = await etherscan.getBlock(args.blockNumberHex);
      const dataProcessTask = { ...args, content: block };
      await this.processQueue.push(dataProcessTask);
      callback(null);
    } catch (e) {
      callback(e);
    }
  }

  async processData(): Promise<number> {
    await super.processData();
    const startTime = Date.now();
    await new Promise((resolve) => {
      this.processQueue.drain = (): void => {
        resolve(null);
      };
      this.processQueue.resume();
    });
    return (Date.now() - startTime) / 1000;
  }

  async cleanQueue(): Promise<void> {
    await this.downloadQueue.kill();
    await this.processQueue.kill();
  }
}
