import Bull from 'bull';
import { Account, Block, Data } from '../models/max-balance.model';
import queueSettings from '../config/bull';

export class BullService {
  downloadQueue: Bull.Queue;
  processQueue: Bull.Queue;

  constructor(public blocksAmount: number, public lastBlock: string) {
    this.downloadQueue = new Bull('downloadQueue', queueSettings);
    this.processQueue = new Bull('processQueue', queueSettings);
  }

  async getMaxChangedBalance(): Promise<Data> {
    const result = await new Promise((resolve) => {
      (async () => {
        const errMsg = await this.setWaitingTime(this.blocksAmount * 1000);
        resolve(errMsg);
      })();

      (async () => {
        const loadingTime = await this.downloadData();
        const data = await this.processData();
        resolve({ ...data, loadingTime });
      })();
    });
    this.cleanQueue();
    return result;
  }

  downloadData() {
    const lastBlockNumberDecimal = parseInt(this.lastBlock, 16);
    let i = 0;

    return new Promise((resolve) => {
      const startTime = Date.now();
      this.downloadQueue.on('completed', async () => {
        const jobs = await this.downloadQueue.getJobs(['completed']);
        if (jobs.length >= this.blocksAmount) resolve((Date.now() - startTime) / 1000);
      });

      this.downloadQueue.add('downloadBlocks', {}, { repeat: { every: 200, limit: this.blocksAmount } });
      this.downloadQueue.process('downloadBlocks', async (job, done) => {
        try {
          ++i;
          if (process.env.logBenchmarks === 'true') console.log(`\ndownload queue iteration ${i}`);
          const blockNumber = (lastBlockNumberDecimal - i).toString(16);
          const response = await fetch(`${process.env.etherscanAPIBlockRequest}&tag=${blockNumber}`);
          const block = (await response.json()) as Block;
          this.processQueue.add('processBlocks', { block });
          const err = 'status' in block || 'error' in block ? Error(JSON.stringify(block.result)) : null;
          done(err);
        } catch (e) {
          console.error('downloadBlocks Error!', e);
          done(e);
        }
      });
    });
  }

  async processData(): Promise<Data> {
    const startTime = Date.now();
    let addressBalances: Account = { '': 0 };
    let maxAccount: Account = { '': 0 };
    let i = 0;
    let amountOfTransactions = 0;

    await new Promise((resolve) => {
      this.processQueue.on('completed', async () => {
        const jobs = await this.processQueue.getJobs(['completed']);
        if (jobs.length >= this.blocksAmount) resolve(null);
      });

      this.processQueue.process('processBlocks', async (job, done) => {
        i++;
        if (process.env.logBenchmarks === 'true') console.log(`\nprocess queue iteration ${i}`);
        const { transactions } = job.data.block.result;
        addressBalances = transactions.reduce((accum, item) => {
          amountOfTransactions++;
          const val = Number(item.value);
          accum[item.to] = (accum[item.to] || 0) + val;
          accum[item.from] = (accum[item.from] || 0) - val;
          maxAccount = this.getMaxAccount({ [item.to]: accum[item.to] }, { [item.from]: accum[item.from] }, maxAccount);
          return accum;
        }, {});
        done();
      });
    });
    const processTime = (Date.now() - startTime) / 1000;
    return { addressBalances, maxAccount, amountOfTransactions, processTime };
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

  setWaitingTime(waitingTime: number): Promise<Data> {
    return new Promise((resolve) => {
      this.downloadQueue.add('deadline', {}, { delay: waitingTime });
      this.downloadQueue.process('deadline', () => {
        resolve({ error: { message: `the waiting time has expired! (${waitingTime} sec)` } });
      });
    });
  }

  cleanQueue() {
    this.downloadQueue.obliterate({ force: true });
    this.processQueue.obliterate({ force: true });
    this.downloadQueue.close();
    this.processQueue.close();
  }
}
