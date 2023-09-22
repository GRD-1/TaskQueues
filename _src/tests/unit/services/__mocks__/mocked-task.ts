import { QueueTaskArgs } from '../../../../models/max-balance.model';
import { MOCKED_BLOCK } from './mocked-block';

export const MOCKED_TASK_CONTENT: QueueTaskArgs = {
  taskNumber: 1,
  blockNumberHex: '0x4e3b7',
  sessionKey: 99999,
  content: MOCKED_BLOCK,
  terminateTask: true,
};

export const MOCKED_TASK = JSON.stringify(MOCKED_TASK_CONTENT);
