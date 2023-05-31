import fetch from 'node-fetch';
import { MainModel } from '../models/main.model';

export class MainController {
  async getMaxChangedAccount(req, res) {
    try {
      const lastBlockNumber = await this.getLastBlockNumber();
      await setTimeout(async () => {
        const transactions: MainModel = (await this.getBlockTransactions(
          lastBlockNumber,
        )) as MainModel;
        res.send(transactions);
      }, 4400);
    } catch (e) {
      console.log(e);
    }
  }

  async getBlockTransactions(blockId) {
    const url = `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${blockId}&boolean=true&apikey=YourApiKeyToken`;
    const result = await fetch(url);
    return result.json();
  }

  async getLastBlockNumber(): Promise<string> {
    const result = await fetch(
      'https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=YourApiKeyToken',
    );
    const data = (await result.json()) as { result: string };
    return data.result;
  }
}
