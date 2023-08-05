import config from 'config';
import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import { Data, Account, DownloadQueueFiller, QueueTaskArgs, Query } from '../models/max-balance.model';
import setTimer from '../utils/timer';
import { EtherscanService } from './etherscan.service';
const etherscan = new EtherscanService();

export class Service {
  constructor(public blocksAmount: number, public lastBlock: string) {}

  async getMaxChangedBalance(): Promise<Data> {
    const result = await new Promise((resolve) => {
      (async (): Promise<void> => {
        const errMsg = await setTimer(this.blocksAmount * config.WAITING_TIME_FOR_BLOCK);
        resolve(errMsg);
      })();

      (async (): Promise<void> => {
        const loadingTime = await this.downloadData();
        const data = await this.processData();
        resolve({ ...data, loadingTime });
      })();
    });
    await this.cleanQueue();
    return result;
  }

  async downloadData(): Promise<number> {
    try {
      const startTime = Date.now();
      return (Date.now() - startTime) / 1000;
    } catch (error) {
      console.error('Error occurred while downloading data:', error.message);
      throw error;
    }
  }

  async processData(): Promise<Data> {
    const startTime = Date.now();
    const processTime = (Date.now() - startTime) / 1000;
    return { processTime };
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

  async getQueryParams(query: Query): Promise<Query> {
    const library = query.library || config.DEFAULT_QUERY.LIBRARY;
    const blocksAmount = query.blocksAmount || config.DEFAULT_QUERY.BLOCKS_AMOUNT;
    const lastBlock = await etherscan.getLastBlockNumber(query);
    return { library, blocksAmount, lastBlock };
  }

  scheduleDownloads(queueFiller: DownloadQueueFiller, lastBlock: string, blocksAmount: number): void {
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
    const job = new SimpleIntervalJob({ milliseconds: 200, runImmediately: true }, task, {
      id: `toadId_${taskNumber}`,
    });
    scheduler.addSimpleIntervalJob(job);
  }

  setTimer(awaitingTime: number): Promise<Data> {
    return new Promise((resolve) => {
      const scheduler = new ToadScheduler();
      const task = new Task('deadline', () => {
        resolve({ error: { message: `the waiting time has expired! (${awaitingTime} msec)` } });
        scheduler.stop();
      });
      const job = new SimpleIntervalJob({ milliseconds: awaitingTime, runImmediately: false }, task);
      scheduler.addSimpleIntervalJob(job);
    });
  }

  cleanQueue: () => Promise<void>;
}
