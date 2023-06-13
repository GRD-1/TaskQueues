import QueueProvider from '../services/queue-provider';
import { Account } from '../models/block.model';

export class MainController {
  async get(req, res) {
    const startTime = Date.now();
    // const blocksAmount = req.query.blocksAmount || 10;
    // const provider = new QueueProvider(req.query?.library);
    // const downloadQueue = provider.getQueue('downloadQueue');
    // const processingQueue = provider.getQueue('processingQueue');
    //
    // this.downloadData(downloadQueue, processingQueue, blocksAmount);
    // const { addressBalances, maxAccount } = await this.processData(processingQueue, blocksAmount);

    const provider = new QueueProvider(req.query);
    const { addressBalances, maxAccount } = await provider.handler();
    // if (process.env.logBenchmarks === 'true') this.logBenchmarks(addressBalances, maxAccount, startTime);
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
