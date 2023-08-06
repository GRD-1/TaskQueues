import { Request, Response } from 'express';
import { BullService } from '../services/bull.service';
import { RabbitmqService } from '../services/rabbitmq.service';
import { FastqService } from '../services/fastq.service';
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

  getQueueProvider(queryParams: Query): BullService | FastqService | RabbitmqService {
    switch (queryParams.library) {
      case 'bull':
        return new BullService(queryParams.blocksAmount, queryParams.lastBlock);
      case 'rabbitmq':
        return new RabbitmqService(queryParams.blocksAmount, queryParams.lastBlock);
      case 'fastq':
        return new FastqService(queryParams.blocksAmount, queryParams.lastBlock);
      default:
        return new FastqService(queryParams.blocksAmount, queryParams.lastBlock);
    }
  }
}
