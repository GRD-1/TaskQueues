import { MOCKED_TASK } from '../../__mocks__/mocked-task';

interface QueueSettings {
  [name: string]: any;
}

interface TaskParams {
  [name: string]: any;
}

export class MockedRabbitmqChannel {
  assertQueue = jest.fn();

  sendToQueue = jest.fn();

  consume(queueName: string, callback: (task: string) => void): void {
    callback(MOCKED_TASK);
  }

  ack = jest.fn();
}
