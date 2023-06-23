import { BullService } from '../services/bull.service';
import getQueryParams from '../utils/query-params-extractor.util';
import getBalanceView from '../views/max-balance.view';

export class MaxBalanceController {
  async get(req, res) {
    const queryParams = await getQueryParams(req.query);
    const provider = this.getQueueProvider(queryParams);
    const data = await provider.getMaxChangedBalance();
    const results = await getBalanceView({ ...queryParams, ...data });
    res.end(results);
  }

  getQueueProvider(queryParams) {
    switch (queryParams.library) {
      case 'bull':
        return new BullService(queryParams.blocksAmount, queryParams.lastBlock);
      case 'queue':
      case 'rabbit':
      default:
        // return new Fastq(queryParams);
        return new BullService(queryParams.blocksAmount, queryParams.lastBlock);
    }
  }
}
