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

export const MOCKED_TASK = JSON.stringify(MOCKED_TASK_CONTENT);

export const MOCKED_JOB = {
  attemptsMade: 0,
  data: MOCKED_TASK,
  name: '',
  opts: undefined,
  queue: undefined,
  returnvalue: undefined,
  stacktrace: [],
  timestamp: 0,
  toJSON(): {
    id: Bull.JobId;
    name: string;
    data: any;
    opts: Bull.JobOptions;
    progress: number;
    delay: number;
    timestamp: number;
    attemptsMade: number;
    failedReason: any;
    stacktrace: string[] | null;
    returnvalue: any;
    finishedOn: number | null;
    processedOn: number | null;
  } {
    return undefined;
  },
  update(data: unknown): Promise<void> {
    return Promise.resolve(undefined);
  },
  discard(): Promise<void> {
    return Promise.resolve(undefined);
  },
  finished(): Promise<any> {
    return Promise.resolve(undefined);
  },
  getState(): Promise<Bull.JobStatus | 'stuck'> {
    return Promise.resolve(undefined);
  },
  isActive(): Promise<boolean> {
    return Promise.resolve(false);
  },
  isCompleted(): Promise<boolean> {
    return Promise.resolve(false);
  },
  isDelayed(): Promise<boolean> {
    return Promise.resolve(false);
  },
  isFailed(): Promise<boolean> {
    return Promise.resolve(false);
  },
  isPaused(): Promise<boolean> {
    return Promise.resolve(false);
  },
  isStuck(): Promise<boolean> {
    return Promise.resolve(false);
  },
  isWaiting(): Promise<boolean> {
    return Promise.resolve(false);
  },
  lockKey(): string {
    return '';
  },
  log(row: string): Promise<any> {
    return Promise.resolve(undefined);
  },
  moveToCompleted(returnValue?: string, ignoreLock?: boolean, notFetch?: boolean): Promise<[any, Bull.JobId] | null> {
    return Promise.resolve(undefined);
  },
  moveToFailed(errorInfo: { message: string }, ignoreLock?: boolean): Promise<[any, Bull.JobId] | null> {
    return Promise.resolve(undefined);
  },
  progress(value?: unknown): any {
    return null;
  },
  promote(): Promise<void> {
    return Promise.resolve(undefined);
  },
  releaseLock(): Promise<void> {
    return Promise.resolve(undefined);
  },
  remove(): Promise<void> {
    return Promise.resolve(undefined);
  },
  retry(): Promise<void> {
    return Promise.resolve(undefined);
  },
  takeLock(): Promise<number | false> {
    return Promise.resolve(undefined);
  },
  id: 1,
};
