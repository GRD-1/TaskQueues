interface QueueSettings {
  [name: string]: any;
}

interface TaskParams {
  [name: string]: any;
}

export class MockedRabbitmqChannel {
  assertQueue(queueName: string, settings: QueueSettings): void {
    console.log('\nMockedRabbitmqChannel assertQueue');
  }

  sendToQueue(queueName: string, taskBuffer: string, params: TaskParams): void {
    console.log('\nMockedRabbitmqChannel sendToQueue');
  }

  consume(queueName: string, callback: (task: string) => Promise<void>): void {
    console.log('\nMockedRabbitmqChannel consume');
  }

  ack(taskBuffer: string): void {
    console.log('\nMockedRabbitmqChannel ack');
  }
}
