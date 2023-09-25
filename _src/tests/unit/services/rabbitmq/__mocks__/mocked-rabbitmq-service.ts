import { SimpleIntervalJob } from 'toad-scheduler';
import { DownloadQueueFiller, DownloadWorkerArgs, ProcessWorkerArgs } from '../../../../../models/max-balance.model';
import { MOCKED_TASK_CONTENT } from '../../__mocks__/mocked-task';
import { RabbitmqService } from '../../../../../services/rabbitmq.service';
import { MockedRabbitmqChannel } from './mocked-rabbitmq-channel';

export class MockedRabbitmqService extends RabbitmqService {
  constructor() {
    super();
    console.log('\nMockedRabbitmqService initialised');
    this.downloadChannel = new MockedRabbitmqChannel();
    this.processChannel = new MockedRabbitmqChannel();
  }

  fillTheQueue(queueFiller: DownloadQueueFiller, lastBlock: string, blocksAmount: number): SimpleIntervalJob[] {
    queueFiller(MOCKED_TASK_CONTENT);
    return [];
  }

  async downloadQueueWorker(args: DownloadWorkerArgs): Promise<void> {
    const { startTime, resolve } = args;
    resolve((Date.now() - startTime) / 1000);
  }

  async processQueueWorker(args: ProcessWorkerArgs): Promise<void> {
    const { startTime, taskCallback, resolve } = args;
    taskCallback(null);
    resolve((Date.now() - startTime) / 1000);
  }
}
