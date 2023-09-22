import { MockedBullService } from './__mocks__/mocked-bull-service';

describe('processData method', () => {
  let mockedBullService: MockedBullService;
  beforeEach(() => {
    mockedBullService = new MockedBullService();
    mockedBullService.sessionKey = 99999;
    mockedBullService.blocksAmount = 1;
  });

  it('should process tasks in the processQueue', async () => {
    const processQueueSpy = jest.spyOn(mockedBullService.processQueue, 'process');
    const processQueueWorkerSpy = jest.spyOn(mockedBullService, 'processQueueWorker');
    await mockedBullService.processData();

    expect(processQueueSpy).toHaveBeenCalledWith('processQueue', expect.any(Function));
    expect(processQueueWorkerSpy).toHaveBeenCalled();
  });
});
