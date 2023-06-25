import { Request, Response } from 'express';
import { BullService } from '../services/bull.service';
import getQueryParams from '../utils/query-params-extractor.util';
import getBalanceView from '../views/max-balance.view';
import { Query } from '../models/max-balance.model';

export class MaxBalanceController {
  async get(req: Request, res: Response): Promise<void> {
    const queryParams = await getQueryParams(req.query);
    const provider = this.getQueueProvider(queryParams);
    const data = await provider.getMaxChangedBalance();
    const results = await getBalanceView({ ...queryParams, ...data });
    res.end(results);
  }

  getQueueProvider(queryParams: Query): BullService {
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
