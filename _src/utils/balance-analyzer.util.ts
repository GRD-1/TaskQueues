import fetch from 'node-fetch';
import { Account, Block, ProcessedData } from '../models/max-balance.model';

export default class BalanceAnalyzer {
  blocksAmount: number;
  lastBlock: string;
  constructor(public taskQueue, query) {
    this.blocksAmount = query.blocksAmount || 10;
    this.lastBlock = query.lastBlock;
  }

  async getMaxChangedBalance() {
    this.downloadData();
    return this.processData();
  }

  async downloadData() {
    // await downloadQueue.empty();
    const lastBlockNumber = await this.getLastBlockNumber();
    const lastBlockNumberDecimal = parseInt(lastBlockNumber.value, 16);
    let i = 1;
    this.taskQueue.add('downloadBlocks', {}, { repeat: { every: 200, limit: this.blocksAmount } });
    this.taskQueue.process('downloadBlocks', async (job, done) => {
      try {
        if (process.env.logBenchmarks === 'true') console.log(`\ndownload queue iteration ${i}`);
        const blockNumber = (lastBlockNumberDecimal - i).toString(16);
        const response = await fetch(`${process.env.etherscanAPIBlockRequest}&tag=${blockNumber}`);
        const block = (await response.json()) as Block;
        this.taskQueue.add('processBlocks', { block });
        ++i;
        const err = 'status' in block || 'error' in block ? Error(JSON.stringify(block.result)) : null;
        done(err);
      } catch (e) {
        console.error('downloadBlocks Error!', e);
        done(e);
      }
    });
  }

  async processData(): Promise<ProcessedData> {
    // await processingQueue.empty();
    let addressBalances: Account = { '': 0 };
    let maxAccount: Account = { '': 0 };
    let i = 1;

    await new Promise((resolve) => {
      this.taskQueue.process('processBlocks', async (job, done) => {
        if (process.env.logBenchmarks === 'true') console.log(`\nprocess queue iteration ${i}`);
        const { transactions } = job.data.block.result;
        addressBalances = transactions.reduce((accum, item) => {
          const val = Number(item.value);
          accum[item.to] = (accum[item.to] || 0) + val;
          accum[item.from] = (accum[item.from] || 0) - val;
          maxAccount = this.getMaxAccount({ [item.to]: accum[item.to] }, { [item.from]: accum[item.from] }, maxAccount);
          return accum;
        }, {});
        ++i;
        if (i > this.blocksAmount) resolve('work is finished!');
        done();
      });
    });
    return { addressBalances, maxAccount };
  }

  async getLastBlockNumber(): Promise<{ err?: string; value?: string }> {
    try {
      const result = await fetch(process.env.etherscanAPILastBlockNumberRequest);
      const data = (await result.json()) as { result: string };
      return { value: data.result };
    } catch (e) {
      console.error('Failed to get the last block number! reason: ', e);
      return { err: e.message };
    }
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