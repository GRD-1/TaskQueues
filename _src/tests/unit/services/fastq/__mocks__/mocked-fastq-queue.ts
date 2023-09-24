import type { done } from 'fastq';
import { QueueTaskArgs } from '../../../../../models/max-balance.model';

export class MockedFastqQueue {
  _drain: () => void;

  constructor(worker: (args: QueueTaskArgs, callback: done) => any, concurrency: number) {}

  async push(task: QueueTaskArgs, callback: (err: Error | null) => void): Promise<void> {
    return Promise.resolve();
  }

  set drain(callback: () => void) {
    this._drain = callback;
    callback();
  }

  get drain(): () => void {
    return this._drain;
  }
}
