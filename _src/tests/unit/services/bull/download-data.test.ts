import { MockedBullService } from './__mocks__/mocked-bull-service';

describe('downloadData method', () => {
  let mockedBullService: MockedBullService;
  beforeEach(() => {
    // const startTime = 1000;
    global.Date.now = (): number => 4000;
    mockedBullService = new MockedBullService();
    mockedBullService.sessionKey = 99999;
    mockedBullService.blocksAmount = 1;
  });

  it('should fill the downloadQueue using fillTheQueue', async () => {
    const fillTheQueueSpy = jest.spyOn(mockedBullService, 'fillTheQueue');
    await mockedBullService.downloadData();

    expect(fillTheQueueSpy).toHaveBeenCalledWith(
      expect.any(Function),
      mockedBullService.lastBlock,
      mockedBullService.blocksAmount,
    );
  });

  it('should process tasks in the downloadQueue', async () => {
    const processQueueSpy = jest.spyOn(mockedBullService.downloadQueue, 'process');
    const downloadQueueWorkerSpy = jest.spyOn(mockedBullService, 'downloadQueueWorker');
    await mockedBullService.downloadData();

    expect(processQueueSpy).toHaveBeenCalledWith('downloadQueue', expect.any(Function));
    expect(downloadQueueWorkerSpy).toHaveBeenCalled();
  });
});
