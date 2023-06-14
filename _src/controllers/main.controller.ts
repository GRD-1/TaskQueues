import QueueProvider from '../services/queue-provider.service';
import { Account } from '../models/block.model';
import BalanceAnalyzer from '../utils/balance-analyzer.util';

export class MainController {
  async get(req, res) {
    const startTime = Date.now();
    const provider = new QueueProvider(req.query);
    const queue = provider.getQueue();
    const balanceAnalyzer = new BalanceAnalyzer(queue, req.query);
    const { addressBalances, maxAccount } = await balanceAnalyzer.getMaxChangedBalance();
    if (process.env.logBenchmarks === 'true') this.logBenchmarks(addressBalances, maxAccount, startTime);
    res.send(Object.keys(maxAccount)[0] || 'no results were found');
  }

  logBenchmarks(addressBalances: Account, maxAccount: Account, startTime: number) {
    const values: number[] = Object.values(addressBalances);
    values.sort((a, b) => b - a);
    console.log('\nexecution time = ', (Date.now() - startTime) / 1000);
    console.log(maxAccount);
    console.log('values.length', values.length);
    console.log(values);
  }
}
