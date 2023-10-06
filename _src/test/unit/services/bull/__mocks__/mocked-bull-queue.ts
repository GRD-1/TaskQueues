import * as Bull from 'bull';
import { MOCKED_JOB } from './mocked-bull-job';

interface QueueSettings {
  redis?: string;
  defaultJobOptions?: string;
  settings?: string;
  limiter?: string;
}

type BullQueueCallback = (job?: Bull.Job<any>, done?: Bull.DoneCallback) => Promise<void>;

export class MockedBullQueue {
  constructor(public name: string, settings: QueueSettings) {}

  async add<T, U>(name: string, task: T, opts: U): Promise<void> {
    return Promise.resolve();
  }

  async process(name: string, callback: BullQueueCallback): Promise<void> {
    await callback(MOCKED_JOB, jest.fn());
  }
}
