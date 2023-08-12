import config from 'config';
import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import { done } from 'fastq';
import { DoneCallback } from 'bull';
import {
  Data,
  Account,
  DownloadQueueFiller,
  DownloadWorkerArgs,
  ProcessWorkerArgs,
  QueueTaskArgs,
} from '../models/max-balance.model';

export class Service {
  readonly sessionKey: number;
  private addressBalances: Account;
  private maxAccount: Account = { undefined };
  private amountOfTransactions = 0;
  public numberOfProcessedTasks = 0;

  constructor(public blocksAmount: number, public lastBlock: string) {
    this.sessionKey = Date.now();
  }

  async getMaxChangedBalance(): Promise<Data> {
    try {
      await this.connectToServer();
      const result = await new Promise((resolve, reject) => {
        (async (): Promise<void> => {
          const errMsg = await this.setTimer(this.blocksAmount * config.WAITING_TIME_FOR_BLOCK);
          resolve(errMsg);
        })();
        (async (): Promise<void> => {
          try {
            const loadingTime = await this.downloadData();
            const processTime = await this.processData();
            resolve({
              addressBalances: this.addressBalances,
              maxAccount: this.maxAccount,
              amountOfTransactions: this.amountOfTransactions,
              processTime,
              loadingTime,
            });
          } catch (err) {
            reject(err);
          }
        })();
      });
      this.cleanQueue();
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  async connectToServer(): Promise<void> {
    return null;
  }

  downloadData(): Promise<number> {
    this.numberOfProcessedTasks = 0;
    return null;
  }

  fillTheQueue(queueFiller: DownloadQueueFiller, lastBlock: string, blocksAmount: number): void {
    const lastBlockNumberDecimal = parseInt(lastBlock, 16);
    let taskNumber = 1;
    let blockNumberHex = (lastBlockNumberDecimal - taskNumber).toString(16);

    const scheduler = new ToadScheduler();
    const task = new Task('download block', () => {
      queueFiller({ taskNumber, blockNumberHex });
      if (taskNumber >= blocksAmount) scheduler.stop();
      taskNumber++;
      blockNumberHex = (lastBlockNumberDecimal - taskNumber).toString(16);
    });
    const interval = config.DEFAULT_QUERY.REQUEST_INTERVAL;
    const job = new SimpleIntervalJob({ milliseconds: interval, runImmediately: true }, task, {
      id: `toadId_${taskNumber}`,
    });
    scheduler.addSimpleIntervalJob(job);
  }

  downloadQueueWorker(args: DownloadWorkerArgs | QueueTaskArgs, callback: done | DoneCallback): Promise<void> {
    return null;
  }

  processData(): Promise<number> {
    this.numberOfProcessedTasks = 0;
    return null;
  }

  async processQueueWorker(args: ProcessWorkerArgs): Promise<void> {
    const { taskNumber, sessionKey, content, startTime } = args;
    const { taskCallback, resolve, reject } = args;
    if (content && sessionKey === this.sessionKey) {
      if (config.LOG_BENCHMARKS === true) console.log(`\nprocess queue iteration ${taskNumber}`);
      this.numberOfProcessedTasks++;
      try {
        if (content.result.transactions) {
          this.addressBalances = content.result.transactions.reduce((accum, item) => {
            this.amountOfTransactions++;
            const val = Number(item.value);
            accum[item.to] = (accum[item.to] || 0) + val;
            accum[item.from] = (accum[item.from] || 0) - val;
            this.maxAccount = this.getMaxAccount(
              { [item.to]: accum[item.to] },
              { [item.from]: accum[item.from] },
              this.maxAccount,
            );
            return accum;
          }, {});
        }
        if (taskCallback) taskCallback(null);
        if (this.numberOfProcessedTasks >= this.blocksAmount) {
          if (resolve) resolve((Date.now() - startTime) / 1000);
        }
      } catch (e) {
        if (taskCallback) taskCallback(e);
        if (reject) reject(e);
      }
    }
  }

  setTimer(awaitingTime: number): Promise<Data> {
    return new Promise((resolve) => {
      const scheduler = new ToadScheduler();
      const task = new Task('deadline', () => {
        resolve({ error: `the waiting time has expired! (${awaitingTime} msec)` });
        scheduler.stop();
      });
      const job = new SimpleIntervalJob({ milliseconds: awaitingTime, runImmediately: false }, task);
      scheduler.addSimpleIntervalJob(job);
    });
  }

  getMaxAccount(...args: Account[]): Account {
    args.sort((a, b) => {
      const item1 = Number.isNaN(Math.abs(Object.values(a)[0])) ? 0 : Math.abs(Object.values(a)[0]);
      const item2 = Number.isNaN(Math.abs(Object.values(b)[0])) ? 0 : Math.abs(Object.values(b)[0]);
      if (item1 === item2) return 0;
      return item1 < item2 ? 1 : -1;
    });
    return args[0];
  }

  cleanQueue(): Promise<void> {
    return null;
  }
}
