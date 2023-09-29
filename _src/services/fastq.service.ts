import fastq from 'fastq';
import config from 'config';
import type { queue, done } from 'fastq';
import { QueueTaskArgs, DownloadQueueFiller } from '../models/max-balance.model';
import { Service } from './service';
import { EtherscanService } from './etherscan.service';
import serviceProvider from '../utils/service-provider.util';

export class FastqService extends Service {
  protected _downloadQueue: queue<QueueTaskArgs, fastq.done>;
  protected _processQueue: queue<QueueTaskArgs, fastq.done>;

  get downloadQueue(): queue<QueueTaskArgs, fastq.done> {
    if (!this._downloadQueue) {
      this._downloadQueue = fastq((args: QueueTaskArgs, callback: done) => this.downloadQueueWorker(args, callback), 1);
    }
    return this._downloadQueue;
  }

  get processQueue(): queue<QueueTaskArgs, fastq.done> {
    if (!this._processQueue) {
      const startTime = Date.now();
      this._processQueue = fastq(async (args: QueueTaskArgs, callback: done) => {
        const dataProcessArgs = { ...args, startTime, taskCallback: callback };
        await this.processQueueWorker(dataProcessArgs);
      }, 1);
      this.processQueue.pause();
    }
    return this._processQueue;
  }

  async connectToServer(): Promise<void> {
    return null;
  }

  async downloadData(): Promise<number> {
    this.numberOfProcessedTasks = 0;
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
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
      const etherscan = serviceProvider.getService(EtherscanService);
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
    this.numberOfProcessedTasks = 0;
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
