import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import { downloadDataCallback, Query } from '../models/max-balance.model';

export default async function scheduleDownloads(
  callback: downloadDataCallback,
  lastBlock: string,
  blocksAmount: number,
): Promise<void> {
  const lastBlockNumberDecimal = parseInt(lastBlock, 16);
  let downloadNumber = 1;
  let blockNumberHex = (lastBlockNumberDecimal - downloadNumber).toString(16);

  const scheduler = new ToadScheduler();
  const task = new Task('download block', () => {
    callback(downloadNumber, blockNumberHex);
    if (downloadNumber >= blocksAmount) scheduler.stop();
    downloadNumber++;
    blockNumberHex = (lastBlockNumberDecimal - downloadNumber).toString(16);
  });
  const job = new SimpleIntervalJob({ milliseconds: 200, runImmediately: true }, task, {
    id: `toadId_${downloadNumber}`,
  });
  scheduler.addSimpleIntervalJob(job);
}
