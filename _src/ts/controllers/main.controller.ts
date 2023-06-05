import fetch from 'node-fetch';
import Bull, { Job } from 'bull';
import bullSettings from '../config/bull';
import { Block, Account, ProcessedData } from '../models/block.model';

export class MainController {
  async getMaxChangedAccount(req, res) {
    const startTime = Date.now();
    const blocksAmount = req.query.blocksAmount || 100;
    const downloadQueue = new Bull('downloadQueue', bullSettings);
    const processingQueue = new Bull('processingQueue', bullSettings);

    this.downloadData(downloadQueue, processingQueue, blocksAmount);
    const { addressBalances, maxAccount } = await this.processData(processingQueue, blocksAmount);

    if (process.env.logBenchmarks === 'true') this.logBenchmarks(addressBalances, maxAccount, startTime);
    res.send(Object.keys(maxAccount)[0] || 'no results were found');
  }

  async downloadData(downloadQueue, processingQueue, blocksAmount?: number) {
    await downloadQueue.empty();
    const lastBlockNumber = await this.getLastBlockNumber();
    const lastBlockNumberDecimal = parseInt(lastBlockNumber.value, 16);
    let i = 1;
    downloadQueue.add(
      'downloadBlocks',
      {},
      {
        repeat: {
          every: 200,
          limit: blocksAmount,
        },
      },
    );

    downloadQueue.process('downloadBlocks', async (job, done) => {
      try {
        if (process.env.logBenchmarks === 'true') console.log(`\ndownload queue iteration ${i}`);
        const blockNumber = (lastBlockNumberDecimal - i).toString(16);
        const response = await fetch(`${process.env.etherscanAPIBlockRequest}&tag=${blockNumber}`);
        const block = (await response.json()) as Block;
        processingQueue.add('processBlocks', { block });
        ++i;
        const err = 'status' in block || 'error' in block ? Error(JSON.stringify(block.result)) : null;
        done(err);
      } catch (e) {
        console.log('downloadBlocks Error!', e);
        done(e);
      }
    });
  }

  async processData(processingQueue, blocksAmount: number): Promise<ProcessedData> {
    await processingQueue.empty();
    let addressBalances: Account = { '': 0 };
    let maxAccount: Account = { '': 0 };
    let i = 1;

    await new Promise((resolve) => {
      processingQueue.process('processBlocks', async (job, done) => {
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
        if (i > blocksAmount) resolve('work is finished!');
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

  logBenchmarks(addressBalances: Account, maxAccount: Account, startTime: number) {
    const values: number[] = Object.values(addressBalances);
    values.sort((a, b) => b - a);
    console.log('\nexecution time = ', (Date.now() - startTime) / 1000);
    console.log(maxAccount);
    console.log('values.length', values.length);
    console.log(values);
  }

  async getJobCount(queue, jobName: string) {
    const jobs = await queue.getJobs([]);
    const filteredJobs = jobs.filter((job) => job.name === jobName);
    console.log(`jobs[${jobName}].length: ${filteredJobs.length}`);
  }
}
