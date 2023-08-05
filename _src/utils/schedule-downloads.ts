import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import { DownloadQueueFiller } from '../models/max-balance.model';

export default function scheduleDownloads(
  queueFiller: DownloadQueueFiller,
  lastBlock: string,
  blocksAmount: number,
): void {
  const lastBlockNumberDecimal = parseInt(lastBlock, 16);
  let taskNumber = 1;
  let blockNumberHex = (lastBlockNumberDecimal - taskNumber).toString(16);

  const scheduler = new ToadScheduler();
  const task = new Task('download block', () => {
    queueFiller({ taskNumber, blockNumberHex });
    if (taskNumber >= blocksAmount) scheduler.stop();
    taskNumber++;
    blockNumberHex = (lastBlockNumberDecimal - taskNumber).toString(16);
  });
  const job = new SimpleIntervalJob({ milliseconds: 200, runImmediately: true }, task, {
    id: `toadId_${taskNumber}`,
  });
  scheduler.addSimpleIntervalJob(job);
}
