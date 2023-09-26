import { MockedRabbitmqService } from './__mocks__/mocked-rabbitmq-service';
import { MOCKED_TASK } from '../__mocks__/mocked-task';

describe('downloadData method', () => {
  let mockedRabbitmqService: MockedRabbitmqService;
  const startTime = 1000;
  global.Date.now = (): number => 1000;
  beforeEach(() => {
    mockedRabbitmqService = new MockedRabbitmqService();
    mockedRabbitmqService.sessionKey = 99999;
    mockedRabbitmqService.blocksAmount = 1;
  });

  it('should fill the downloadQueue using fillTheQueue', async () => {
    const fillTheQueueSpy = jest.spyOn(mockedRabbitmqService, 'fillTheQueue');
    await mockedRabbitmqService.downloadData();

    expect(fillTheQueueSpy).toHaveBeenCalledWith(
      expect.any(Function),
      mockedRabbitmqService.lastBlock,
      mockedRabbitmqService.blocksAmount,
    );
  });

  it('should process tasks in the downloadQueue', async () => {
    const downloadChannel = await mockedRabbitmqService.getDownloadChannel();
    const downloadChannelSpy = jest.spyOn(downloadChannel, 'consume');
    const downloadQueueWorkerSpy = jest.spyOn(mockedRabbitmqService, 'downloadQueueWorker');
    await mockedRabbitmqService.downloadData();

    expect(downloadChannelSpy).toHaveBeenCalledWith('downloadQueue', expect.any(Function));
    expect(downloadQueueWorkerSpy).toHaveBeenCalled();
    expect(downloadQueueWorkerSpy.mock.calls[0][0]).toEqual({
      task: MOCKED_TASK,
      startTime,
      resolve: expect.any(Function),
      reject: expect.any(Function),
    });
  });
});
