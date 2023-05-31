import fetch from 'node-fetch';
import { MainModel, Transaction, Account } from '../models/main.model';

export class MainController {
  async getMaxChangedAccount(req, res) {
    try {
      const apikey = 'apikey' in req.query ? req.query.apikey : process.env.apikey;
      let blockNumber = await this.getLastBlockNumber(apikey);
      blockNumber = --blockNumber;
      const transactions: Transaction[] = (await this.getBlockTransactions(blockNumber, apikey)) as Transaction[];
      let maxAccount: Account = {};
      if (transactions) {
        const addressBalances = transactions.reduce((accum, item) => {
          const val = Number(item.value);
          accum[item.to] = (accum[item.to] || 0) + val;
          accum[item.from] = (accum[item.from] || 0) - val;
          maxAccount = this.getMaxAccount({ [item.to]: accum[item.to] }, { [item.from]: accum[item.from] }, maxAccount);
          return accum;
        }, <Account>{});
        this.tests(addressBalances, maxAccount, blockNumber);
      }
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

  async getLastBlockNumber(apikey): Promise<number> {
    const result = await fetch(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${apikey}`);
    const data = (await result.json()) as { result: number };
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

  tests(addressBalances, maxAccount, blockNumber) {
    const values: number[] = Object.values(addressBalances);
    values.sort((a, b) => b - a);
    console.log('\nblockNumber', blockNumber);
    console.log(maxAccount);
    console.log(values);
  }
}
