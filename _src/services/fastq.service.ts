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
    this.downloadQueue = fastq((args: QueueTaskArgs, callback: done) => this.downloadQueueWorker(args, callback), 1);
    this.processQueue = fastq(async (args: QueueTaskArgs, callback: done) => {
      const dataProcessArgs = { ...args, startTime, taskCallback: callback };
      await this.processQueueWorker(dataProcessArgs);
    }, 1);
    this.processQueue.pause();

    const queueFiller: DownloadQueueFiller = (args: QueueTaskArgs) => {
      const terminateTask = args.taskNumber >= this.blocksAmount;
      const task = { ...args, terminateTask, sessionKey: this.sessionKey };
      this.downloadQueue.push(task);
    };
    this.fillTheQueue(queueFiller, this.lastBlock, this.blocksAmount);

    return new Promise((resolve) => {
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
      const err = 'status' in block || 'error' in block ? Error(JSON.stringify(block.result)) : null;
      callback(err);
    } catch (e) {
      console.error('\ndownloadBlocks Error!', e);
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
