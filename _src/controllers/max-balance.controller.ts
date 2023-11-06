import { Request, Response } from 'express';
import { BullService } from '../services/bull.service';
import { RabbitmqService } from '../services/rabbitmq.service';
import { FastqService } from '../services/fastq.service';
import getQueryParams from '../utils/query-params-extractor.util';
import { Query } from '../models/max-balance.model';
import View from '../views/view';

export class MaxBalanceController {
  async get(req: Request, res: Response): Promise<void> {
    try {
      // здесь вставим утечку памяти
      console.log('\nMaxBalanceController\n');

      const queryParams = await getQueryParams(req.query);
      const provider = this.getQueueProvider(queryParams);
      const data = await provider.getMaxChangedBalance();
      const results = await View.getBalanceView({ ...queryParams, ...data });
      res.end(results);
    } catch (e) {
      globalThis.ERROR_EMITTER.emit('Error', e);
      res.end(e.message);
    }
  }

  getQueueProvider(queryParams: Query): BullService | FastqService | RabbitmqService {
    switch (queryParams.library) {
      case 'bull':
        return new BullService(queryParams.blocksAmount, queryParams.lastBlock);
      case 'rabbitmq':
        return new RabbitmqService(queryParams.blocksAmount, queryParams.lastBlock);
      default:
        return new FastqService(queryParams.blocksAmount, queryParams.lastBlock);
    }
  }
}
