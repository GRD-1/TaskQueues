import * as Bull from 'bull';
import { SimpleIntervalJob } from 'toad-scheduler';
import { BullService } from '../../../../../services/bull.service';
import { DownloadQueueFiller, DownloadWorkerArgs } from '../../../../../models/max-balance.model';
import { MOCKED_TASK_CONTENT, MockedBullQueue } from './mocked-bull-queue';

export class MockedBullService extends BullService {
  get downloadQueue(): Bull.Queue {
    if (!this._downloadQueue) {
      this._downloadQueue = new MockedBullQueue('downloadQueue', {}) as unknown as Bull.Queue;
    }
    return this._downloadQueue;
  }

  get processQueue(): Bull.Queue {
    if (!this._processQueue) {
      this._processQueue = new MockedBullQueue('processQueue', {}) as unknown as Bull.Queue;
    }
    return this._processQueue;
  }

  constructor() {
    super();
  }

  fillTheQueue(queueFiller: DownloadQueueFiller, lastBlock: string, blocksAmount: number): SimpleIntervalJob[] {
    queueFiller(MOCKED_TASK_CONTENT);
    return [];
  }

  async downloadQueueWorker(args: DownloadWorkerArgs, callback: Bull.DoneCallback): Promise<void> {
    const { startTime, resolve } = args;
    callback();
    resolve((Date.now() - startTime) / 1000);
  }
}
