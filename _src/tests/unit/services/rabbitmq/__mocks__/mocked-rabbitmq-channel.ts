import { MOCKED_TASK } from '../../../__mocks__/mocked-task';

export class MockedRabbitmqDownloadChannel {
  assertQueue = jest.fn();

  sendToQueue = jest.fn();

  consume(queueName: string, callback: (task: unknown) => void): void {
    callback(MOCKED_TASK);
  }

  ack = jest.fn();
}

export class MockedRabbitmqProcessChannel extends MockedRabbitmqDownloadChannel {
  consume(queueName: string, callback: (task: { content: string }) => void): void {
    callback({ content: MOCKED_TASK });
  }
}
