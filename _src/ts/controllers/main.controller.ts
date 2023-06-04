import fetch from 'node-fetch';
import Queue from 'queue';
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler';
import { QueueWorker } from '../models/npm-queue-worker.model';
import { Block, Account, ProcessedData } from '../models/block.model';

export class MainController {
  async getMaxChangedAccount(req, res) {
    const startTime = Date.now();
    const queue = new Queue({ results: [], concurrency: 1, autostart: true });
    const blocksAmount = req.query.blocksAmount || 100;

    await this.processBlockQueue(queue, blocksAmount);
    const { addressBalances, maxAccount } = await this.getResults(queue, blocksAmount);
    if (process.env.logBenchmarks === 'true') this.logBenchmarks(addressBalances, maxAccount, startTime);
    res.send(Object.keys(maxAccount)[0] || 'no results were found');
  }

  async processBlockQueue(queue: Queue, blocksAmount?: number) {
    const lastBlockNumber = await this.getLastBlockNumber();
    const lastBlockNumberDecimal = parseInt(lastBlockNumber.value, 16);
    const scheduler = new ToadScheduler();
    let i = 0;

    const task = new Task('download block', async () => {
      if (i >= blocksAmount) {
        scheduler.stopById('job1');
        console.log('\nthe block downloading is completed');
        return;
      }
      console.log(`block №${i}`);
      const blockNumber = (lastBlockNumberDecimal - i).toString(16);
      const blockAddedToQueue = await this.addBlockToQueue(blockNumber, queue, blocksAmount);
      if (blockAddedToQueue) ++i;
    });
    const job = new SimpleIntervalJob({ milliseconds: 200 }, task, {
      id: 'job1',
      preventOverrun: true,
    });
    scheduler.addSimpleIntervalJob(job);
  }

  async addBlockToQueue(blockNumber: string, queue: Queue, blocksAmount: number) {
    try {
      const response = await fetch(`${process.env.etherscanAPIBlockRequest}&tag=${blockNumber}`);
      const block = (await response.json()) as Block;
      if (!('status' in block)) {
        queue.push((cb) => {
          const worker = new QueueWorker(block, blockNumber);
          const result = worker.processBlock(queue, blocksAmount);
          cb(null, result);
        });
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Failed to get the data block! reason: ', e.message);
      return false;
    }
  }

  async getResults(queue: Queue, blocksAmount: number) {
    let addressBalances: Account = { address: 0 };
    let maxAccount: Account = { address: 0 };
    const scheduler = new ToadScheduler();

    await new Promise((resolve) => {
      const task = new Task('download block', () => {
        // console.log('\nqueue.results.length: ', queue.results.length);
        if (queue.results.length >= blocksAmount) {
          console.log('\nresults are received!!! ');
          scheduler.stopById('job2');
          ({ addressBalances, maxAccount } = queue.results[queue.results.length - 2][0]);
          resolve({ addressBalances, maxAccount });
        }
      });
      const job = new SimpleIntervalJob({ milliseconds: 250 }, task, {
        id: 'job2',
      });
      scheduler.addSimpleIntervalJob(job);
    });
    return { addressBalances, maxAccount };
  }

  async getLastBlockNumber(): Promise<{ err?: string; value?: string }> {
    try {
      const result = await fetch(process.env.etherscanAPILastBlockNumberRequest);
      const data = (await result.json()) as { result: string };
      return { value: data.result };
    } catch (e) {
      console.warn('Failed to get the last block number! reason: ', e.message);
      return { err: e.message };
    }
  }

  logBenchmarks(addressBalances: Account, maxAccount: Account, startTime: number) {
    const values: number[] = Object.values(addressBalances);
    values.sort((a, b) => b - a);
    console.log('\nexecution time = ', (Date.now() - startTime) / 1000);
    console.log(maxAccount);
    console.log('values.length', values.length);
    // console.log(values);
  }
}
