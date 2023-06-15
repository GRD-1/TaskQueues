import QueueProvider from '../services/queue-provider.service';
import BalanceAnalyzer from '../utils/max-balance.util';
import getQueryParams from '../utils/query-params-extractor.util';
import getBalanceView from '../views/max-balance.view';

export class MaxBalanceController {
  async get(req, res) {
    const startTime = Date.now();
    const queryParams = await getQueryParams(req.query);
    const provider = new QueueProvider(queryParams.library);
    const queue = provider.getQueue();
    const balanceAnalyzer = new BalanceAnalyzer(queue, queryParams);
    const data = await balanceAnalyzer.getMaxChangedBalance();
    const results = await getBalanceView({ ...queryParams, startTime, ...data });
    res.end(results);
  }
}
