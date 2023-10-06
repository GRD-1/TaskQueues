import { SimpleIntervalJob } from 'toad-scheduler';
import { queue, done } from 'fastq';
import { FastqService } from '../../../../../services/fastq.service';
import { DownloadQueueFiller, ProcessWorkerArgs, QueueTaskArgs } from '../../../../../models/max-balance.model';
import { MOCKED_TASK_CONTENT } from '../../../__mocks__/mocked-task';
import { MockedFastqQueue } from './mocked-fastq-queue';

export class MockedFastqService extends FastqService {
  get downloadQueue(): queue<QueueTaskArgs, done> {
    if (!this._downloadQueue) {
      this._downloadQueue = new MockedFastqQueue(this.downloadQueueWorker, 1) as unknown as queue;
    }
    return this._downloadQueue;
  }

  get processQueue(): queue<QueueTaskArgs, done> {
    if (!this._processQueue) {
      this._processQueue = new MockedFastqQueue(this.processQueueWorker, 1) as unknown as queue;
    }
    return this._processQueue;
  }

  fillTheQueue(queueFiller: DownloadQueueFiller, lastBlock: string, blocksAmount: number): SimpleIntervalJob[] {
    queueFiller(MOCKED_TASK_CONTENT);
    return [];
  }

  async downloadQueueWorker(args: QueueTaskArgs, callback: done): Promise<void> {
    callback(null);
  }

  async processQueueWorker(args: ProcessWorkerArgs): Promise<void> {
    const { startTime, taskCallback, resolve } = args;
    taskCallback(null);
    resolve((Date.now() - startTime) / 1000);
  }
}
