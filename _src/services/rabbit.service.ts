import amqp from 'amqplib/callback_api';
import { Block, Data, Account, DownloadTaskArgs, DownloadWorker, ProcessWorker } from '../models/max-balance.model';

amqp.connect('amqp://localhost', (error0, connection) => {
  if (error0) {
    throw error0;
  }

  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }
    const queue = 'hello';
    const msg = 'Hello world';

    channel.assertQueue(queue, {
      durable: false,
    });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(' [x] Sent %s', msg);
  });

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
});

export class FastqService {
  downloadQueue: string[];
  processQueue: string[];
  addressBalances: Account;
  maxAccount: Account;
  amountOfTransactions = 0;

  // workerForDownloadQueue: DownloadWorker = async (args: DownloadTaskArgs, callback: done): Promise<void> => {
  //   try {
  //     if (process.env.logBenchmarks === 'true') console.log(`\ndownload queue iteration ${args.downloadNumber}`);
  //     const response = await fetch(`${process.env.etherscanAPIBlockRequest}&tag=${args.blockNumberHex}`);
  //     const block = (await response.json()) as Block;
  //     block.downloadNumber = args.downloadNumber;
  //     await this.processQueue.push(block);
  //     const err = 'status' in block || 'error' in block ? Error(JSON.stringify(block.result)) : null;
  //     callback(err);
  //   } catch (e) {
  //     console.error('\ndownloadBlocks Error!', e);
  //     callback(e);
  //   }
  // };
  //
  // workerForProcessQueue: ProcessWorker = async (block: Block, callback: done): Promise<void> => {
  //   if (process.env.logBenchmarks === 'true') console.log(`\nprocess queue iteration ${block.downloadNumber}`);
  //   const { transactions } = block.result;
  //   this.addressBalances = transactions.reduce((accum, item) => {
  //     this.amountOfTransactions++;
  //     const val = Number(item.value);
  //     accum[item.to] = (accum[item.to] || 0) + val;
  //     accum[item.from] = (accum[item.from] || 0) - val;
  //     this.maxAccount = this.getMaxAccount(
  //       { [item.to]: accum[item.to] },
  //       { [item.from]: accum[item.from] },
  //       this.maxAccount,
  //     );
  //     return accum;
  //   }, {});
  //   callback(null);
  // };
  // constructor(public blocksAmount: number, public lastBlock: string) {
  //   this.downloadQueue = fastq(this.workerForDownloadQueue, 1);
  //   this.processQueue = fastq(this.workerForProcessQueue, 1);
  //   this.processQueue.pause();
  // }
  //
  async getMaxChangedBalance(): Promise<Data> {
    const result = await new Promise((resolve) => {
      //     // (async (): Promise<void> => {
      //     //   const errMsg = await this.setAwaitingTime(this.blocksAmount * 1000);
      //     //   resolve(errMsg);
      //     // })();
      //
      //     (async (): Promise<void> => {
      //       const loadingTime = await this.downloadData();
      //       const processTime = await this.processData();
      //       resolve({
      //         addressBalances: this.addressBalances,
      //         maxAccount: this.maxAccount,
      //         amountOfTransactions: this.amountOfTransactions,
      //         loadingTime,
      //         processTime,
      //       });
      //     })();
    });
    //   this.cleanQueue();
    return result;
  }

  // downloadData(): Promise<number> {
  //   const startTime = Date.now();
  // const lastBlockNumberDecimal = parseInt(this.lastBlock, 16);
  // let downloadNumber = 1;
  // let blockNumberHex = (lastBlockNumberDecimal - downloadNumber).toString(16);
  //
  // const scheduler = new ToadScheduler();
  // const task = new Task('download block', () => {
  //   this.downloadQueue.push({ downloadNumber, blockNumberHex });
  //   if (downloadNumber >= this.blocksAmount) scheduler.stop();
  //   downloadNumber++;
  //   blockNumberHex = (lastBlockNumberDecimal - downloadNumber).toString(16);
  // });
  // const job = new SimpleIntervalJob({ milliseconds: 200, runImmediately: true }, task, {
  //   id: `toadId_${downloadNumber}`,
  // });
  // scheduler.addSimpleIntervalJob(job);
  // return new Promise((resolve) => {
  //   this.downloadQueue.drain = (): void => {
  //     resolve((Date.now() - startTime) / 1000);
  //   };
  // });
  // }
  // async processData(): Promise<number> {
  // const startTime = Date.now();
  // await new Promise((resolve) => {
  //   this.processQueue.drain = (): void => {
  //     resolve(null);
  //   };
  //   this.processQueue.resume();
  // });
  // return (Date.now() - startTime) / 1000;
  // }
  // getMaxAccount(...args: Account[]): Account {
  //   args.sort((a, b) => {
  //     const item1 = Number.isNaN(Math.abs(Object.values(a)[0])) ? 0 : Math.abs(Object.values(a)[0]);
  //     const item2 = Number.isNaN(Math.abs(Object.values(b)[0])) ? 0 : Math.abs(Object.values(b)[0]);
  //     if (item1 === item2) return 0;
  //     return item1 < item2 ? 1 : -1;
  //   });
  //   return args[0];
  // }
  // setAwaitingTime(awaitingTime: number): Promise<Data> {
  //   return new Promise((resolve) => {
  //     console.log('\nsetAwaitingTime');
  //     const scheduler = new ToadScheduler();
  //     const task = new Task('deadline', () => {
  //       resolve({ error: { message: `the waiting time has expired! (${awaitingTime} msec)` } });
  //       scheduler.stop();
  //     });
  //     const job = new SimpleIntervalJob({ milliseconds: awaitingTime, runImmediately: false }, task);
  //     scheduler.addSimpleIntervalJob(job);
  //     console.log('setAwaitingTime end');
  //   });
  // }
  // async cleanQueue(): Promise<void> {
  //   await this.downloadQueue.kill();
  //   await this.processQueue.kill();
  // }
}
