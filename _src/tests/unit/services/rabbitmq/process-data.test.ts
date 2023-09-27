import { MockedRabbitmqService } from './__mocks__/mocked-rabbitmq-service';

describe('processData method', () => {
  const mockedRabbitmqService = new MockedRabbitmqService();
  mockedRabbitmqService.sessionKey = 99999;
  mockedRabbitmqService.blocksAmount = 1;

  it('should process tasks in the processQueue', async () => {
    const processChannel = await mockedRabbitmqService.getProcessChannel();
    const processChannelSpy = jest.spyOn(processChannel, 'consume');
    const processQueueWorkerSpy = jest.spyOn(mockedRabbitmqService, 'processQueueWorker');
    await mockedRabbitmqService.processData();

    expect(processChannelSpy).toHaveBeenCalledWith('processQueue', expect.any(Function));
    expect(processQueueWorkerSpy).toHaveBeenCalled();
  });
});
