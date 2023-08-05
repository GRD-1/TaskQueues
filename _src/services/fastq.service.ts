import fastq from 'fastq';
import config from 'config';
import type { queue, done } from 'fastq';
import { Data, Account, QueueTaskArgs, TaskWorker, DownloadQueueFiller } from '../models/max-balance.model';
import scheduleDownloads from '../utils/schedule-downloads';
import setTimer from '../utils/timer';
import getMaxAccount from '../utils/get-max-account';
import { EtherscanService } from './etherscan.service';
const etherscan = new EtherscanService();

export class FastqService {
  downloadQueue: queue<QueueTaskArgs, fastq.done>;
  processQueue: queue<QueueTaskArgs, fastq.done>;
  addressBalances: Account;
  maxAccount: Account;
  amountOfTransactions = 0;

  constructor(public blocksAmount: number, public lastBlock: string) {
    this.downloadQueue = fastq(this.workerForDownloadQueue, 1);
    this.processQueue = fastq(this.workerForProcessQueue, 1);
    this.processQueue.pause();
  }

  async getMaxChangedBalance(): Promise<Data> {
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
          loadingTime,
          processTime,
        });
      })();
    });
    this.cleanQueue();
    return result;
  }

  downloadData(): Promise<number> {
    const startTime = Date.now();
    const queueFiller: DownloadQueueFiller = (args: QueueTaskArgs) => {
      this.downloadQueue.push({ ...args });
    };
    scheduleDownloads(queueFiller, this.lastBlock, this.blocksAmount);
    return new Promise((resolve) => {
      this.downloadQueue.drain = (): void => {
        resolve((Date.now() - startTime) / 1000);
      };
    });
  }

  async processData(): Promise<number> {
    const startTime = Date.now();
    await new Promise((resolve) => {
      this.processQueue.drain = (): void => {
        resolve(null);
      };
      this.processQueue.resume();
    });
    return (Date.now() - startTime) / 1000;
  }

  workerForDownloadQueue: TaskWorker = async (args: QueueTaskArgs, callback: done): Promise<void> => {
    try {
      if (config.LOG_BENCHMARKS === true) console.log(`\ndownload queue iteration ${args.taskNumber}`);
      const block = await etherscan.getBlock(args.blockNumberHex);
      const task: QueueTaskArgs = { ...args, content: block };
      await this.processQueue.push(task);
      const err = 'status' in block || 'error' in block ? Error(JSON.stringify(block.result)) : null;
      callback(err);
    } catch (e) {
      console.error('\ndownloadBlocks Error!', e);
      callback(e);
    }
  };

  workerForProcessQueue: TaskWorker = async (args: QueueTaskArgs, callback: done): Promise<void> => {
    if (config.LOG_BENCHMARKS === true) console.log(`\nprocess queue iteration ${args.taskNumber}`);
    const { transactions } = args.content.result;
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
    callback(null);
  };

  async cleanQueue(): Promise<void> {
    await this.downloadQueue.kill();
    await this.processQueue.kill();
  }
}
