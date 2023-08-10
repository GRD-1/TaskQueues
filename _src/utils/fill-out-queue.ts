import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import config from 'config';
import { DownloadQueueFiller } from '../models/max-balance.model';

export default function fillOutQueue(queueFiller: DownloadQueueFiller, lastBlock: string, blocksAmount: number): void {
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
  const interval = config.DEFAULT_QUERY.REQUEST_INTERVAL;
  const job = new SimpleIntervalJob({ milliseconds: interval, runImmediately: true }, task, {
    id: `toadId_${taskNumber}`,
  });
  scheduler.addSimpleIntervalJob(job);
}
