interface QueueSettings {
  [name: string]: any;
}

interface TaskParams {
  [name: string]: any;
}

export class MockedRabbitmqChannel {
  assertQueue = jest.fn();

  sendToQueue = jest.fn();

  consume = jest.fn();

  ack = jest.fn();
}
