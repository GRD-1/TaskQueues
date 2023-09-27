import {
  getMockedEtherscanService,
  getFailedEtherscanService,
  getNeverCalledEtherscanService,
} from '../__mocks__/mocked-etherscan-service';
import { MockedRabbitmqServiceWithoutDownloadQueueWorker } from './__mocks__/mocked-rabbitmq-service';
import serviceProvider from '../../../../utils/service-provider.util';
import { MOCKED_TASK, MOCKED_TASK_CONTENT } from '../__mocks__/mocked-task';

describe('unit rabbitmq.downloadQueueWorker', () => {
  const startTime = 1000;
  global.Date.now = (): number => 4000;
  let mockedRabbitmqService: MockedRabbitmqServiceWithoutDownloadQueueWorker;
  let resolve: typeof jest.fn;
  let reject: typeof jest.fn;

  beforeEach(() => {
    mockedRabbitmqService = new MockedRabbitmqServiceWithoutDownloadQueueWorker();
    mockedRabbitmqService.sessionKey = 99999;
    mockedRabbitmqService.blocksAmount = 1;
    mockedRabbitmqService.numberOfProcessedTasks = 10;
    resolve = jest.fn();
    reject = jest.fn();
  });

  it('should process a valid task and resolve when successful', async () => {
    const etherscan = getMockedEtherscanService();
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);
    const downloadChannel = await mockedRabbitmqService.getDownloadChannel();

    await mockedRabbitmqService.downloadQueueWorker({ task: { content: MOCKED_TASK }, startTime, resolve, reject });

    expect(resolve).toHaveBeenCalledWith(3);
    expect(downloadChannel.sendToQueue).toHaveBeenCalledWith('processQueue', Buffer.from(MOCKED_TASK), {
      persistent: true,
    });
    expect(downloadChannel.ack).toHaveBeenCalledWith({ content: MOCKED_TASK });
  });

  it('should handle an invalid task and reject when etherscan.getBlock fails', async () => {
    const etherscan = getFailedEtherscanService();
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);

    await mockedRabbitmqService.downloadQueueWorker({ task: { content: MOCKED_TASK }, startTime, resolve, reject });

    expect(reject).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should ignore tasks with mismatched sessionKey', async () => {
    const etherscan = getNeverCalledEtherscanService();
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);
    MOCKED_TASK_CONTENT.sessionKey = 0;
    const task = { content: JSON.stringify(MOCKED_TASK_CONTENT) };

    await mockedRabbitmqService.downloadQueueWorker({ task, startTime, resolve, reject });

    expect(resolve).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
    expect(etherscan.getBlock).not.toHaveBeenCalled();
  });

  it('should ignore tasks with null taskContent', async () => {
    const etherscan = getNeverCalledEtherscanService();
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);
    const task = { content: JSON.stringify(null) };

    await mockedRabbitmqService.downloadQueueWorker({ task, startTime, resolve, reject });

    expect(resolve).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
    expect(etherscan.getBlock).not.toHaveBeenCalled();
  });
});
