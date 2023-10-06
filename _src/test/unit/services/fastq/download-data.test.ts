import { MockedFastqService } from './__mocks__/mocked-fastq-service';
import { MOCKED_TASK_CONTENT } from '../../__mocks__/mocked-task';

describe('unit fastq.downloadData', () => {
  let mockedFastqService: MockedFastqService;
  beforeEach(() => {
    mockedFastqService = new MockedFastqService();
    mockedFastqService.sessionKey = 99999;
    mockedFastqService.blocksAmount = 1;
  });

  it('should fill the downloadQueue using fillTheQueue', async () => {
    const fillTheQueueSpy = jest.spyOn(mockedFastqService, 'fillTheQueue');
    await mockedFastqService.downloadData();

    expect(fillTheQueueSpy).toHaveBeenCalledWith(
      expect.any(Function),
      mockedFastqService.lastBlock,
      mockedFastqService.blocksAmount,
    );
  });

  it('should process tasks in the downloadQueue', async () => {
    const pushQueueSpy = jest.spyOn(mockedFastqService.downloadQueue, 'push');
    await mockedFastqService.downloadData();

    expect(pushQueueSpy).toHaveBeenCalledWith(MOCKED_TASK_CONTENT, expect.any(Function));
    expect(mockedFastqService.downloadQueue.drain).toBeInstanceOf(Function);
  });
});
