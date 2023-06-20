import Bull from 'bull';
import { Account, Block, Data, ProcessedData } from '../models/max-balance.model';
import queueSettings from '../config/bull';

export class BullService {
  taskQueue: Bull.Queue;

  constructor(public blocksAmount: number, public lastBlock: string) {
    this.taskQueue = new Bull('taskQueue', queueSettings);
  }

  async getMaxChangedBalance() {
    // this.taskQueue.add('deadline', {}, { delay: this.blocksAmount * 200 });
    // const deadline = this.taskQueue.process('deadline', async (job, done) => {
    //   await this.taskQueue.obliterate({ force: true });
    // });
    // deadline.then(result => );

    await this.downloadData();
    const data = await this.processData();
    await this.taskQueue.obliterate({ force: true });
    this.taskQueue.close();
    return data;
  }

  async downloadData() {
    const lastBlockNumberDecimal = parseInt(this.lastBlock, 16);
    let i = 0;
    await this.taskQueue.add('downloadBlocks', {}, { repeat: { every: 200, limit: this.blocksAmount } });
    await this.taskQueue.process('downloadBlocks', async (job, done) => {
      try {
        ++i;
        if (process.env.logBenchmarks === 'true') console.log(`\ndownload queue iteration ${i}`);
        const blockNumber = (lastBlockNumberDecimal - i).toString(16);
        const response = await fetch(`${process.env.etherscanAPIBlockRequest}&tag=${blockNumber}`);
        const block = (await response.json()) as Block;
        this.taskQueue.add('processBlocks', { block });
        const err = 'status' in block || 'error' in block ? Error(JSON.stringify(block.result)) : null;
        // if (i >= this.blocksAmount) {
        // }
        done(err);
      } catch (e) {
        console.error('downloadBlocks Error!', e);
        done(e);
      }
    });
    console.log('\nData downloading completed!');
  }

  async processData(): Promise<Data> {
    const startTime = Date.now();
    let addressBalances: Account = { '': 0 };
    let maxAccount: Account = { '': 0 };
    let i = 0;
    let amountOfTransactions = 0;

    console.log('\nData processing started!');
    await new Promise((resolve) => {
      this.taskQueue.process('processBlocks', async (job, done) => {
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
        if (i >= this.blocksAmount) resolve('the blocks processing is finished!');
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
}
