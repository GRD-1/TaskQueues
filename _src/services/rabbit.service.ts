import amqp from 'amqplib';
import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import { Block, Data, Account, DownloadTaskArgs, DownloadWorker, ProcessWorker } from '../models/max-balance.model';

async function connectToRabbitMQ(): Promise<void> {
  try {
    // Replace 'rabbitmq' with the service name you defined in docker-compose.yml
    const connection = await amqp.connect('amqp://rabbitmq');
    // Create a channel
    const channel = await connection.createChannel();
    // Now you have a connection and a channel to interact with RabbitMQ

    // ... Do more operations with RabbitMQ ...

    // Don't forget to close the connection when you're done
    await connection.close();
  } catch (error) {
    console.error('Error occurred:', error.message);
  }
}

export class RabbitService {
  // downloadQueue: Bull.Queue;
  // processQueue: Bull.Queue;
  //
  constructor(public blocksAmount: number, public lastBlock: string) {
    //   const queueSettings = {
    //     redis: config.REDIS,
    //     defaultJobOptions: config.BULL.JOB_OPTIONS,
    //     settings: config.BULL.SETTINGS,
    //     limiter: config.BULL.LIMITER,
    //   };
    //   this.downloadQueue = new Bull('downloadQueue', queueSettings);
    //   this.processQueue = new Bull('processQueue', queueSettings);
  }

  async getMaxChangedBalance(): Promise<Data> {
    if (await this.isRabbitUnavailable()) return { error: new Error('Error connecting to RabbitMQ!') };
    const result = await new Promise((resolve) => {
      (async (): Promise<void> => {
        const errMsg = await this.setAwaitingTime(this.blocksAmount * 200);
        resolve(errMsg);
      })();

      // (async (): Promise<void> => {
      //   const loadingTime = await this.downloadData();
      //   const data = await this.processData();
      //   resolve({ ...data, loadingTime });
      // })();
    });
    // this.cleanQueue();
    return result;
  }

  // downloadData(): Promise<number> {
  //   const lastBlockNumberDecimal = parseInt(this.lastBlock, 16);
  //   let i = 0;
  //
  //   return new Promise((resolve) => {
  //     const startTime = Date.now();
  //     this.downloadQueue.on('completed', async () => {
  //       const jobs = await this.downloadQueue.getJobs(['completed']);
  //       if (jobs.length >= this.blocksAmount) resolve((Date.now() - startTime) / 1000);
  //     });
  //
  //     this.downloadQueue.add('downloadBlocks', {}, { repeat: { every: 200, limit: this.blocksAmount } });
  //     this.downloadQueue.process('downloadBlocks', async (job, done) => {
  //       try {
  //         ++i;
  //         if (config.LOG_BENCHMARKS === 'true') console.log(`\ndownload queue iteration ${i}`);
  //         const blockNumber = (lastBlockNumberDecimal - i).toString(16);
  //         const request = `${config.ETHERSCAN_API.GET_BLOCK}&tag=${blockNumber}&apikey=${config.ETHERSCAN_APIKEY}`;
  //         const response = await fetch(request);
  //         const block = (await response.json()) as Block;
  //         await this.processQueue.add('processBlocks', { block });
  //         const err = 'status' in block || 'error' in block ? Error(JSON.stringify(block.result)) : null;
  //         done(err);
  //       } catch (e) {
  //         console.error('downloadBlocks Error!', e);
  //         done(e);
  //       }
  //     });
  //   });
  // }
  //
  // async processData(): Promise<Data> {
  //   const startTime = Date.now();
  //   let addressBalances: Account = { '': 0 };
  //   let maxAccount: Account = { '': 0 };
  //   let i = 0;
  //   let amountOfTransactions = 0;
  //
  //   await new Promise((resolve) => {
  //     this.processQueue.on('completed', async () => {
  //       const jobs = await this.processQueue.getJobs(['completed']);
  //       if (jobs.length >= this.blocksAmount) resolve(null);
  //     });
  //
  //     this.processQueue.process('processBlocks', async (job, done) => {
  //       i++;
  //       if (config.LOG_BENCHMARKS === 'true') console.log(`\nprocess queue iteration ${i}`);
  //       const { transactions } = job.data.block.result;
  //       addressBalances = transactions.reduce((accum, item) => {
  //         amountOfTransactions++;
  //         const val = Number(item.value);
  //         accum[item.to] = (accum[item.to] || 0) + val;
  //         accum[item.from] = (accum[item.from] || 0) - val;
  //         maxAccount = this.getMaxAccount({ [item.to]: accum[item.to] }, { [item.from]: accum[item.from] }, maxAccount);
  //         return accum;
  //       }, {});
  //       done();
  //     });
  //   });
  //   const processTime = (Date.now() - startTime) / 1000;
  //   return { addressBalances, maxAccount, amountOfTransactions, processTime };
  // }
  //
  // getMaxAccount(...args: Account[]): Account {
  //   args.sort((a, b) => {
  //     const item1 = Number.isNaN(Math.abs(Object.values(a)[0])) ? 0 : Math.abs(Object.values(a)[0]);
  //     const item2 = Number.isNaN(Math.abs(Object.values(b)[0])) ? 0 : Math.abs(Object.values(b)[0]);
  //     if (item1 === item2) return 0;
  //     return item1 < item2 ? 1 : -1;
  //   });
  //   return args[0];
  // }

  setAwaitingTime(awaitingTime: number): Promise<Data> {
    return new Promise((resolve) => {
      const scheduler = new ToadScheduler();
      const task = new Task('deadline', () => {
        resolve({ error: { message: `the waiting time has expired! (${awaitingTime} msec)` } });
        scheduler.stop();
      });
      const job = new SimpleIntervalJob({ milliseconds: awaitingTime, runImmediately: false }, task);
      scheduler.addSimpleIntervalJob(job);
    });
  }

  // async cleanQueue(): Promise<void> {
  //   await this.downloadQueue.obliterate({ force: true });
  //   await this.processQueue.obliterate({ force: true });
  //   await this.downloadQueue.close();
  //   await this.processQueue.close();
  // }

  async isRabbitUnavailable(): Promise<boolean> {
    try {
      const connection = await amqp.connect('amqp://rabbitmq');
      await connection.close();
      return false;
    } catch (error) {
      return true;
    }
  }
}
