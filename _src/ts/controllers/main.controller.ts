import fetch from 'node-fetch';
import { MainModel, Transaction, Account } from '../models/main.model';

export class MainController {
  async getMaxChangedAccount(req, res) {
    try {
      const start = Date.now();
      const apikey = 'apikey' in req.query ? req.query.apikey : process.env.apikey;
      const lastBlockNumber = await this.getLastBlockNumber(apikey);
      const lastBlockNumberDecimal = parseInt(lastBlockNumber, 16);
      const addressBalances: Account = {};
      let maxAccount: Account = {};
      let i = lastBlockNumberDecimal;
      while (i > lastBlockNumberDecimal - 100) {
        const blockNumber = i.toString(16);
        const transactions: Transaction[] = (await this.getBlockTransactions(blockNumber, apikey)) as Transaction[];
        console.log('i = ', lastBlockNumberDecimal - i);
        // console.log('blockNumber = ', blockNumber);
        // console.log('transactions count = ', transactions.length);
        if (transactions) {
          transactions.reduce((accum, item) => {
            const val = Number(item.value);
            accum[item.to] = (accum[item.to] || 0) + val;
            accum[item.from] = (accum[item.from] || 0) - val;
            maxAccount = this.getMaxAccount(
              { [item.to]: accum[item.to] },
              { [item.from]: accum[item.from] },
              maxAccount,
            );
            return accum;
          }, addressBalances);
        }
        --i;
      }
      this.benchmarks(addressBalances, maxAccount, start);
      res.send(Object.keys(maxAccount)[0] || 'no results were found');
    } catch (e) {
      console.log(e);
    }
  }

  async getBlockTransactions(blockId, apikey) {
    const url = `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${blockId}&boolean=true&apikey=${apikey}`;
    const response = await fetch(url);
    const block = (await response.json()) as MainModel;
    return block?.result?.transactions;
  }

  async getLastBlockNumber(apikey): Promise<string> {
    const result = await fetch(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${apikey}`);
    const data = (await result.json()) as { result: string };
    return data.result;
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
