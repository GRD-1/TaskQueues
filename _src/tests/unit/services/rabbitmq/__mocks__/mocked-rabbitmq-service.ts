import { SimpleIntervalJob } from 'toad-scheduler';
import { DownloadQueueFiller, DownloadWorkerArgs, ProcessWorkerArgs } from '../../../../../models/max-balance.model';
import { MOCKED_TASK_CONTENT } from '../../__mocks__/mocked-task';
import { RabbitmqService } from '../../../../../services/rabbitmq.service';
import { MockedRabbitmqDownloadChannel, MockedRabbitmqProcessChannel } from './mocked-rabbitmq-channel';

export class MockedRabbitmqServiceWithoutDownloadQueueWorker extends RabbitmqService {
  async getDownloadChannel(): Promise<MockedRabbitmqDownloadChannel> {
    if (!this.downloadChannel) {
      this.downloadChannel = new MockedRabbitmqDownloadChannel();
    }
    return this.downloadChannel;
  }

  async getProcessChannel(): Promise<MockedRabbitmqProcessChannel> {
    if (!this.processChannel) {
      this.processChannel = new MockedRabbitmqProcessChannel();
    }
    return this.processChannel;
  }

  constructor() {
    super();
    this.downloadChannel = new MockedRabbitmqDownloadChannel();
    this.processChannel = new MockedRabbitmqProcessChannel();
  }

  fillTheQueue(queueFiller: DownloadQueueFiller, lastBlock: string, blocksAmount: number): SimpleIntervalJob[] {
    queueFiller(MOCKED_TASK_CONTENT);
    return [];
  }

  async processQueueWorker(args: ProcessWorkerArgs): Promise<void> {
    const { startTime, resolve } = args;
    resolve((Date.now() - startTime) / 1000);
  }
}

export class MockedRabbitmqService extends MockedRabbitmqServiceWithoutDownloadQueueWorker {
  async downloadQueueWorker(args: DownloadWorkerArgs): Promise<void> {
    const { startTime, resolve } = args;
    resolve((Date.now() - startTime) / 1000);
  }
}
