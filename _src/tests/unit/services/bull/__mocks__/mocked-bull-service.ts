import * as Bull from 'bull';
import { SimpleIntervalJob } from 'toad-scheduler';
import { BullService } from '../../../../../services/bull.service';
import { DownloadQueueFiller, DownloadWorkerArgs, ProcessWorkerArgs } from '../../../../../models/max-balance.model';
import { MockedBullQueue } from './mocked-bull-queue';
import { MOCKED_TASK_CONTENT } from '../../__mocks__/mocked-task';

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

  async processQueueWorker(args: ProcessWorkerArgs): Promise<void> {
    const { startTime, taskCallback, resolve } = args;
    taskCallback(null);
    resolve((Date.now() - startTime) / 1000);
  }
}
