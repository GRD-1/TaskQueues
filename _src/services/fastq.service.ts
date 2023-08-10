import fastq from 'fastq';
import config from 'config';
import type { queue, done } from 'fastq';
import { Data, Account, QueueTaskArgs, DownloadQueueFiller, ProcessWorkerArgs } from '../models/max-balance.model';
import fillTheQueue from '../utils/fill-the-queue';
import setTimer from '../utils/timer';
import getMaxAccount from '../utils/get-max-account';
import { EtherscanService } from './etherscan.service';
const etherscan = new EtherscanService();

export class FastqService {
  private downloadQueue: queue<QueueTaskArgs, fastq.done>;
  private processQueue: queue<QueueTaskArgs, fastq.done>;
  readonly sessionKey: number;
  private addressBalances: Account;
  private maxAccount: Account = { undefined };
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
    return null;
  }

  downloadData(): Promise<number> {
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
    fillTheQueue(queueFiller, this.lastBlock, this.blocksAmount);

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
    const startTime = Date.now();
    await new Promise((resolve) => {
      this.processQueue.drain = (): void => {
        resolve(null);
      };
      this.processQueue.resume();
    });
    return (Date.now() - startTime) / 1000;
  }

  async processQueueWorker(args: ProcessWorkerArgs): Promise<void> {
    const { taskNumber, sessionKey, terminateTask, content, startTime } = args;
    const { taskCallback, resolve, reject } = args;
    if (content && sessionKey === this.sessionKey) {
      if (config.LOG_BENCHMARKS === true) console.log(`\nprocess queue iteration ${taskNumber}`);
      try {
        const transactions = content?.result?.transactions;
        if (transactions) {
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
        }
      } catch (e) {
        taskCallback(e);
        if (reject) reject(e);
      }
      taskCallback(null);
      if (terminateTask) {
        console.log('\nprocessQueue is drained!');
        if (resolve) resolve((Date.now() - startTime) / 1000);
      }
    }
  }

  async cleanQueue(): Promise<void> {
    await this.downloadQueue.kill();
    await this.processQueue.kill();
  }
}
