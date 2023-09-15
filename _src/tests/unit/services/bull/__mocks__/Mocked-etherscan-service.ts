import Bull from 'bull';

interface QueueSettings {
  redis?: string;
  defaultJobOptions?: string;
  settings?: string;
  limiter?: string;
}

export class ExtendedBull {
  constructor(name: string, settings: QueueSettings) {
    console.log('\nFAKE BULL LIB WAS LAUNCHED!');
  }
  async add<T>(data: T): Promise<void> {
    return Promise.resolve();
  }
}

export function getExtendedBullQueueInstance(name: string, settings: QueueSettings): Bull.Queue {
  return new ExtendedBull('processQueue', {}) as unknown as Bull.Queue;
}
