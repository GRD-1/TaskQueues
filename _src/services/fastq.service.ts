import fastq from 'fastq';
import config from 'config';
import type { queue, done } from 'fastq';
import {
  Block,
  Data,
  Account,
  DownloadTaskArgs,
  DownloadWorker,
  ProcessWorker,
  downloadDataCallback,
} from '../models/max-balance.model';
import scheduleDownloads from '../utils/schedule-downloads';
import setTimer from '../utils/timer';
import getMaxAccount from '../utils/get-max-account';

export class FastqService {
  downloadQueue: queue<DownloadTaskArgs, fastq.done>;
  processQueue: queue<Block, fastq.done>;
  addressBalances: Account;
  maxAccount: Account;
  amountOfTransactions = 0;

  workerForDownloadQueue: DownloadWorker = async (args: DownloadTaskArgs, callback: done): Promise<void> => {
    try {
      if (config.LOG_BENCHMARKS === 'true') console.log(`\ndownload queue iteration ${args.downloadNumber}`);
      const request = `${config.ETHERSCAN_API.GET_BLOCK}&tag=${args.blockNumberHex}&apikey=${config.ETHERSCAN_APIKEY}`;
      const response = await fetch(request);
      const block = (await response.json()) as Block;
      block.downloadNumber = args.downloadNumber;
      await this.processQueue.push(block);
      const err = 'status' in block || 'error' in block ? Error(JSON.stringify(block.result)) : null;
      callback(err);
    } catch (e) {
      console.error('\ndownloadBlocks Error!', e);
      callback(e);
    }
  };

  workerForProcessQueue: ProcessWorker = async (block: Block, callback: done): Promise<void> => {
    if (config.LOG_BENCHMARKS === 'true') console.log(`\nprocess queue iteration ${block.downloadNumber}`);
    const { transactions } = block.result;
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

  constructor(public blocksAmount: number, public lastBlock: string) {
    this.downloadQueue = fastq(this.workerForDownloadQueue, 1);
    this.processQueue = fastq(this.workerForProcessQueue, 1);
    this.processQueue.pause();
  }

  async getMaxChangedBalance(): Promise<Data> {
    const result = await new Promise((resolve) => {
      (async (): Promise<void> => {
        const errMsg = await setTimer(this.blocksAmount * 1000);
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
    const callback: downloadDataCallback = (downloadNumber, blockNumberHex) => {
      this.downloadQueue.push({ downloadNumber, blockNumberHex });
    };
    scheduleDownloads(callback, this.lastBlock, this.blocksAmount);
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

  async cleanQueue(): Promise<void> {
    await this.downloadQueue.kill();
    await this.processQueue.kill();
  }
}
