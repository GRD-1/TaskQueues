import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import { DownloadQueueFiller } from '../models/max-balance.model';

export default async function scheduleDownloads(
  queueFiller: DownloadQueueFiller,
  lastBlock: string,
  blocksAmount: number,
): Promise<void> {
  const lastBlockNumberDecimal = parseInt(lastBlock, 16);
  let downloadNumber = 1;
  let blockNumberHex = (lastBlockNumberDecimal - downloadNumber).toString(16);

  const scheduler = new ToadScheduler();
  const task = new Task('download block', () => {
    queueFiller(downloadNumber, blockNumberHex);
    if (downloadNumber >= blocksAmount) scheduler.stop();
    downloadNumber++;
    blockNumberHex = (lastBlockNumberDecimal - downloadNumber).toString(16);
  });
  const job = new SimpleIntervalJob({ milliseconds: 200, runImmediately: true }, task, {
    id: `toadId_${downloadNumber}`,
  });
  scheduler.addSimpleIntervalJob(job);
}
