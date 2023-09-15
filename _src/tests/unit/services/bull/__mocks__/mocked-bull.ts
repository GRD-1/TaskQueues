import * as Bull from 'bull';
import { QueueTaskArgs } from '../../../../../models/max-balance.model';
import { MOCKED_BLOCK } from './mocked-etherscan-service';

export const MOCKED_TASK_CONTENT: QueueTaskArgs = {
  taskNumber: 1,
  blockNumberHex: '0x4e3b7',
  sessionKey: 99999,
  content: MOCKED_BLOCK,
  terminateTask: true,
};

export const MOCKED_TASK = { data: JSON.stringify(MOCKED_TASK_CONTENT) };

interface QueueSettings {
  redis?: string;
  defaultJobOptions?: string;
  settings?: string;
  limiter?: string;
}

export class MockedBull {
  constructor(public name: string, settings: QueueSettings) {}

  async add<T>(data: T): Promise<void> {
    return Promise.resolve();
  }
}

export function getMockedQueue(name: string, settings: QueueSettings): Bull.Queue {
  return new MockedBull('processQueue', {}) as unknown as Bull.Queue;
}
