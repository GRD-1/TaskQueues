import fetch from 'node-fetch';
import Queue from 'queue';
import { QueueWorker } from '../models/queue-worker.model';
import { Block, Account } from '../models/block.model';

export class NewController {
  async getTheMaxChangedAccount(req, res) {
    try {
      const start = Date.now();
      const queue = new Queue({ results: [] });

      this.fillTheBlockQueue(queue);

      this.calculateBalances(queue, start, res);

      // const { addressBalances, maxAccount } = await this.calculateBalances(queue);
      //
      // this.benchmarks(addressBalances, maxAccount, start);
      //
      // res.send(Object.keys(maxAccount)[0] || 'no results were found');
    } catch (e) {
      console.log(e);
    }
  }

  async fillTheBlockQueue(queue) {
    const lastBlockNumber = await this.getLastBlockNumber();
    const lastBlockNumberDecimal = parseInt(lastBlockNumber, 16);
    let i = 99;

    const timerId = setInterval(async () => {
      const blockNumber = (lastBlockNumberDecimal - i).toString(16);
      const blockAddedToQueue = await this.addBlockToQueue(blockNumber, queue);
      if (blockAddedToQueue) ++i;
      if (i >= 100) clearInterval(timerId);
    }, 250);
  }

  async addBlockToQueue(blockNumber: string, queue: Queue) {
    const url = `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=true&apikey=${process.env.apikey}`;
    const response = await fetch(url);
    const block = (await response.json()) as Block;
    // console.log('\nblockNumber: ', blockNumber);
    // console.log('block: ', block);
    if (!('status' in block)) {
      // const worker = new QueueWorker(blockNumber, block);
      // queue.push(worker);
      queue.push((cb) => {
        const result = blockNumber;
        console.log('\nqueue element: ', blockNumber);
        cb(null, result);
      });

      return true;
    }
    return false;
  }

  async getLastBlockNumber(): Promise<string> {
    const result = await fetch(
      `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.apikey}`,
    );
    const data = (await result.json()) as { result: string };
    return data.result;
  }

  async calculateBalances(queue: Queue, start: number, res) {
    const addressBalances: Account = {};
    const maxAccount: Account = {};
    const j = 0;

    setTimeout(() => {
      console.log('queue.length:', queue.length);
      queue.start((err) => {
        if (err) throw err;
        res.send(Object.keys(maxAccount)[0] || 'no results were found');
        console.log('all done:', queue.results);
      });

      // const timerId2 = setInterval(() => {
      //     if (!queue.theQueueIsEmpty()) {
      //       console.log(j);
      //       const { transactions } = queue.tail.value.result;
      //       transactions.reduce((accum, item) => {
      //         const val = Number(item.value);
      //         accum[item.to] = (accum[item.to] || 0) + val;
      //         accum[item.from] = (accum[item.from] || 0) - val;
      //         maxAccount = this.getMaxAccount(
      //           { [item.to]: accum[item.to] },
      //           { [item.from]: accum[item.from] },
      //           maxAccount,
      //         );
      //         return accum;
      //       }, addressBalances);
      //       queue.removeFromTail();
      //       j++;
      //       if (j >= 100) {
      //         clearInterval(timerId2);
      //         this.benchmarks(addressBalances, maxAccount, start);
      // res.send(Object.keys(maxAccount)[0] || 'no results were found');
      //       }
      //     }
      //   }, 200);
    }, 3000);
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

  benchmarks(addressBalances, maxAccount, startTime) {
    const values: number[] = Object.values(addressBalances);
    values.sort((a, b) => b - a);
    console.log('\nexecution time = ', (Date.now() - startTime) / 1000);
    console.log(maxAccount);
    console.log('values.length', values.length);
    console.log(values);
  }
}
