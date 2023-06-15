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

    res.send(Object.keys(maxAccount)[0] || 'no results were found');
  }
}
