import Bull from 'bull';
import { Account, Block, Data, ProcessedData } from '../models/max-balance.model';
import queueSettings from '../config/bull';

export class BullService {
  taskQueue: Bull.Queue;

  constructor(public blocksAmount: number, public lastBlock: string) {
    this.taskQueue = new Bull('taskQueue', queueSettings);
  }

  async getMaxChangedBalance() {
    // return new Promise((resolve) => {
    // this.taskQueue.add('deadline', {}, { delay: this.blocksAmount * 2000 });
    // this.taskQueue.process('deadline', (job, done) => {
    //   this.taskQueue.obliterate({ force: true });
    //   this.taskQueue.close();
    //   console.log('\ndeadline reached!!!');
    //   resolve({ error: { message: 'deadline reached!!!' } });
    // });

    await this.taskQueue.obliterate({ force: true });
    const CompletedJobsCounts = await this.taskQueue.getJobCounts();
    console.log('\nCompletedJobsCounts = ', CompletedJobsCounts);

    await this.downloadData();
    const data = await this.processData();
    await this.taskQueue.obliterate({ force: true });
    await this.taskQueue.close();
    return data;
    // });
  }

  downloadData() {
    const lastBlockNumberDecimal = parseInt(this.lastBlock, 16);
    let i = 0;

    return new Promise((resolve) => {
      const eventHandler = async () => {
        if (await this.isTheTaskCompleted('downloadBlocks', this.blocksAmount)) {
          this.taskQueue.removeListener('completed', eventHandler);
          resolve(null);
        }
      };
      this.taskQueue.on('completed', eventHandler);

      this.taskQueue.add('downloadBlocks', {}, { repeat: { every: 200, limit: this.blocksAmount } });
      this.taskQueue.process('downloadBlocks', async (job, done) => {
        try {
          ++i;
          if (process.env.logBenchmarks === 'true') console.log(`\ndownload queue iteration ${i}`);
          const blockNumber = (lastBlockNumberDecimal - i).toString(16);
          const response = await fetch(`${process.env.etherscanAPIBlockRequest}&tag=${blockNumber}`);
          const block = (await response.json()) as Block;
          this.taskQueue.add('processBlocks', { block });
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

    console.log('\nData processing started!');
    await new Promise((resolve) => {
      const eventHandler = async () => {
        if (await this.isTheTaskCompleted('processBlocks', this.blocksAmount * 2)) {
          this.taskQueue.removeListener('completed', eventHandler);
          resolve(null);
        }
      };
      this.taskQueue.on('completed', eventHandler);

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

  async IsTaskQueueEmpty(number: number, process: string): Promise<boolean> {
    const completedJobsCount = await this.taskQueue.getCompletedCount();
    const CompletedJobsCounts = await this.taskQueue.getJobCounts();
    const queueDrained = completedJobsCount >= number;
    if (queueDrained) {
      console.log('\nnumber: ', number);
      console.log('process: ', process);
      console.log('CompletedJobsCounts = ', CompletedJobsCounts);
      const activeJob = await this.taskQueue.getJobs(['active']);
      console.log('activeJob = ', activeJob[0]?.name);
      console.log('failedReason = ', activeJob[0]?.failedReason);
    }
    return queueDrained;
  }

  async isTheTaskCompleted(taskName, numberOfTasks) {
    const jobs = await this.taskQueue.getJobs(['completed']);
    const filteredJobs = jobs.filter((job) => job.name === taskName);
    console.log(`\n${[taskName]}.length: ${filteredJobs.length}`);
    console.log('isTheTaskCompleted: ', filteredJobs.length >= numberOfTasks);
    const CompletedJobsCounts = await this.taskQueue.getJobCounts();
    console.log('CompletedJobsCounts = ', CompletedJobsCounts);
    return filteredJobs.length >= numberOfTasks;
  }
}
