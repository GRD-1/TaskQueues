import QueueProvider from '../services/queue-provider.service';
import BalanceAnalyzer from '../utils/balance-analyzer.util';
import balanceView from '../views/max-balance.view';

export class MaxBalanceController {
  async get(req, res) {
    const startTime = Date.now();
    const provider = new QueueProvider(req.query);
    const queue = provider.getQueue();
    const balanceAnalyzer = new BalanceAnalyzer(queue, req.query);
    const { addressBalances, maxAccount } = await balanceAnalyzer.getMaxChangedBalance();
    const results = await balanceView(req.query, addressBalances, maxAccount, startTime);
    res.end(results);
  }
}
