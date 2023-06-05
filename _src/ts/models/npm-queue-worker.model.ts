import { Account, Block } from './block.model';

export class QueueWorker {
  blockNumber: string;
  value: Block;

  constructor(value: Block, blockNumber: string) {
    this.blockNumber = blockNumber;
    this.value = value;
  }

  processBlock(queue, blocksAmount) {
    // const previousResultIndex = queue.results.length > 1 ? queue.results.length - 2 : 0;
    // let addressBalances: Account = { '': 0 };
    // let maxAccount: Account = { '': 0 };
    // if (queue.results.length > 1) ({ addressBalances, maxAccount } = queue.results[previousResultIndex][0]);
    //
    // const { transactions } = this.value.result;
    // transactions.reduce((accum, item) => {
    //   const val = Number(item.value);
    //   accum[item.to] = (accum[item.to] || 0) + val;
    //   accum[item.from] = (accum[item.from] || 0) - val;
    //   maxAccount = this.getMaxAccount({ [item.to]: accum[item.to] }, { [item.from]: accum[item.from] }, maxAccount);
    //   return accum;
    // }, addressBalances);
    //
    // if (process.env.logTheBenchmarks === 'true') {
    //   this.logBenchmarks(addressBalances, maxAccount, previousResultIndex, queue, blocksAmount);
    // }
    // return { addressBalances, maxAccount };
  }

  // getMaxAccount(...args: Account[]): Account {
  //   args.sort((a, b) => {
  //     const item1 = Number.isNaN(Math.abs(Object.values(a)[0])) ? 0 : Math.abs(Object.values(a)[0]);
  //     const item2 = Number.isNaN(Math.abs(Object.values(b)[0])) ? 0 : Math.abs(Object.values(b)[0]);
  //     if (item1 === item2) return 0;
  //     return item1 < item2 ? 1 : -1;
  //   });
  //   return args[0];
  // }

  logBenchmarks(addressBalances, maxAccount, previousResultIndex, queue, blocksAmount: number) {
    const previousResult = queue.results[previousResultIndex];
    console.log(`\nblock ${blocksAmount - queue.results.length}`);
    // console.log('this transactions[0].blockNumber = ', this.value.result.transactions[0].blockNumber);
    console.log('maxAccount = ', maxAccount);
    // console.log(`block ${101 - queue.results.length}`);
    // console.log('\nqueue.results.length: ', queue.results.length);
    // console.log('queue.results:', queue.results);
    // console.log('previousResultIndex = ', previousResultIndex);
    // console.log('previousResult = ', previousResult);
    // console.log('\nnew result: ', { addressBalances, maxAccount });
    // console.log('\nqueue element: ', this.blockNumber);
  }
}
