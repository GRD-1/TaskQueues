import fetch from 'node-fetch';
import Queue from 'queue';
import { QueueWorker } from '../models/queue-worker.model';
import { Block, Account, ProcessedData } from '../models/block.model';

export class NpmQueueController {
  async getMaxChangedAccount(req, res) {
    const startTime = Date.now();
    const queue = new Queue({ results: [], concurrency: 1, autostart: true });
    const blocksAmount = req.query.blocksAmount || 100;

    this.processBlockQueue(queue, blocksAmount);

    const { addressBalances, maxAccount } = await this.getResults(queue, blocksAmount);

    if (process.env.logBenchmarks === 'true') {
      this.benchmarks(addressBalances, maxAccount, startTime);
    }
    res.send(Object.keys(maxAccount)[0] || 'no results were found');
  }

  async processBlockQueue(queue: Queue, blocksAmount?: number) {
    const lastBlockNumber = await this.getLastBlockNumber();
    const lastBlockNumberDecimal = parseInt(lastBlockNumber.value, 16);
    let i = blocksAmount;

    const timerId = setInterval(async () => {
      const blockNumber = (lastBlockNumberDecimal - i).toString(16);
      const blockAddedToQueue = await this.addBlockToQueue(blockNumber, queue, blocksAmount);
      if (blockAddedToQueue) ++i;
      if (i >= blocksAmount) {
        clearInterval(timerId);
      }
    }, 250);
  }

  async addBlockToQueue(blockNumber: string, queue: Queue, blocksAmount: number) {
    try {
      const url = `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=true&apikey=${process.env.apikey}`;
      const response = await fetch(url);
      const block = (await response.json()) as Block;
      if (!('status' in block)) {
        queue.push((cb) => {
          const worker = new QueueWorker(block, blockNumber);
          const result = worker.handler(queue, blocksAmount);
          cb(null, result);
        });
        return true;
      }
      return false;
    } catch (e) {
      console.log('Failed to get the data block! reason: ', e.message);
      return false;
    }
  }

  async getResults(queue: Queue, blocksAmount: number) {
    let addressBalances: Account = { valory: 0 };
    let maxAccount: Account = { ravoly: 0 };
    const delay = await new Promise((resolve) => {
      setTimeout((val = 0) => {
        const timerId = setInterval(() => {
          if (queue.results.length >= blocksAmount) {
            clearInterval(timerId);
            ({ addressBalances, maxAccount } = queue.results[queue.results.length - 2][0]);
            resolve(val);
          }
        }, 200);
      }, 3000);
    });
    return { addressBalances, maxAccount };
  }

  async getLastBlockNumber(): Promise<{ err?: string; value?: string }> {
    try {
      const result = await fetch(
        `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.apikey}`,
      );
      const data = (await result.json()) as { result: string };
      return { value: data.result };
    } catch (e) {
      console.log('Failed to get the last block number! reason: ', e.message);
      return { err: e.message };
    }
  }

  benchmarks(addressBalances: Account, maxAccount: Account, startTime: number) {
    const values: number[] = Object.values(addressBalances);
    values.sort((a, b) => b - a);
    console.log('\nexecution time = ', (Date.now() - startTime) / 1000);
    console.log(maxAccount);
    console.log('values.length', values.length);
    console.log(values);
  }
}
