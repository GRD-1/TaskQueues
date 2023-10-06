import { Service } from '../../../../../services/service';

export class MockedService extends Service {
  connectToServer(): Promise<void> {
    return Promise.resolve(undefined);
  }

  downloadData(): Promise<number> {
    return Promise.resolve(0);
  }

  processData(): Promise<number> {
    return Promise.resolve(0);
  }

  cleanQueue(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
