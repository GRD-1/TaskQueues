import fastq from 'fastq';
import type { queue, done } from 'fastq';
import { Block, Data, Account, DownloadWorker } from '../models/max-balance.model';

export class FastqService {
  downloadQueue: queue<DownloadWorker, fastq.done>;
  processQueue: queue<Block, fastq.done>;
  addressBalances: Account;
  maxAccount: Account;
  amountOfTransactions: number;
  workerForDownloadQueue: (args: DownloadWorker, callback: done) => Promise<void>;
  workerForProcessQueue: (block: Block, callback: done) => Promise<void>;

  constructor(public blocksAmount: number, public lastBlock: string) {
    this.workerForDownloadQueue = async (args: DownloadWorker, callback: done): Promise<void> => {
      try {
        if (process.env.logBenchmarks === 'true') console.log(`\ndownload queue iteration ${args.downloadNumber}`);
        const response = await fetch(`${process.env.etherscanAPIBlockRequest}&tag=${args.blockNumberHex}`);
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

    this.workerForProcessQueue = async (block: Block, callback: done): Promise<void> => {
      if (process.env.logBenchmarks === 'true') console.log(`\nprocess queue iteration ${block.downloadNumber}`);
      const { transactions } = block.result;
      this.addressBalances = transactions.reduce((accum, item) => {
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
      callback(null);
    };

    this.downloadQueue = fastq(this.workerForDownloadQueue, 1);
    this.processQueue = fastq(this.workerForProcessQueue, 1);
    this.processQueue.pause();
  }

  async getMaxChangedBalance(): Promise<Data> {
    const result = await new Promise((resolve) => {
      // (async (): Promise<void> => {
      //   const errMsg = await this.setWaitingTime(this.blocksAmount * 1500);
      //   resolve(errMsg);
      // })();

      (async (): Promise<void> => {
        const loadingTime = await this.downloadData();
        const data = await this.processData();
        resolve({ ...data, loadingTime });
      })();
    });
    // this.cleanQueue();
    return result;
  }

  downloadData(): Promise<number> {
    const lastBlockNumberDecimal = parseInt(this.lastBlock, 16);
    const downloadNumber = 0;

    return new Promise((resolve) => {
      const startTime = Date.now();
      const blockNumberHex = (lastBlockNumberDecimal - downloadNumber).toString(16);
      this.downloadQueue.push({ downloadNumber, blockNumberHex });

      this.downloadQueue.drain = (): void => {
        console.log('\ndownloadBlocks completed!');
        resolve((Date.now() - startTime) / 1000);
      };
    });
  }

  async processData(): Promise<Data> {
    const startTime = Date.now();
    await new Promise((resolve) => {
      this.processQueue.drain = (): void => {
        console.error('\nprocess Blocks completed!');
        resolve(null);
      };
      this.processQueue.resume();
    });
    const processTime = (Date.now() - startTime) / 1000;
    return {
      addressBalances: this.addressBalances,
      maxAccount: this.maxAccount,
      amountOfTransactions: this.amountOfTransactions,
      processTime,
    };
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

  // setWaitingTime(waitingTime: number): Promise<Data> {
  //   return new Promise((resolve) => {
  //     this.downloadQueue.add('deadline', {}, { delay: waitingTime });
  //     this.downloadQueue.process('deadline', () => {
  //       resolve({ error: { message: `the waiting time has expired! (${waitingTime} sec)` } });
  //     });
  //   });
  // }

  // async cleanQueue(): Promise<void> {
  //   await this.downloadQueue.obliterate({ force: true });
  //   await this.processQueue.obliterate({ force: true });
  //   await this.downloadQueue.close();
  //   await this.processQueue.close();
  // }
}
