import { getMockedQueue, MOCKED_TASK, MOCKED_TASK_CONTENT } from './__mocks__/mocked-bull';
import {
  getMockedEtherscanService,
  getFailedEtherscanService,
  getNeverCalledEtherscanService,
} from './__mocks__/mocked-etherscan-service';
import { BullService } from '../../../../services/bull.service';
import serviceProvider from '../../../../utils/service-provider.util';

describe('downloadQueueWorker function', () => {
  const startTime = 1000;
  global.Date.now = (): number => 4000;
  const bullService = serviceProvider.getService(BullService);
  bullService.sessionKey = 99999;
  bullService.processQueue = getMockedQueue('processQueue', {});
  bullService.blocksAmount = 1;
  bullService.numberOfProcessedTasks = 10;

  it('should process a valid task and resolve when successful', async () => {
    const resolve = jest.fn();
    const reject = jest.fn();
    const callback = jest.fn();
    const etherscan = getMockedEtherscanService();
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);

    await bullService.downloadQueueWorker({ task: MOCKED_TASK, startTime, resolve, reject }, callback);

    expect(callback).toHaveBeenCalledWith();
    expect(resolve).toHaveBeenCalledWith(3);
  });

  it('should handle an invalid task and reject when etherscan.getBlock fails', async () => {
    const etherscan = getFailedEtherscanService();
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);

    const resolve = jest.fn();
    const reject = jest.fn();
    const callback = jest.fn();

    await bullService.downloadQueueWorker({ task: MOCKED_TASK, startTime, resolve, reject }, callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error));
    expect(reject).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should ignore tasks with mismatched sessionKey', async () => {
    const resolve = jest.fn();
    const reject = jest.fn();
    const callback = jest.fn();

    const etherscan = getNeverCalledEtherscanService();
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);
    MOCKED_TASK_CONTENT.sessionKey = 0;
    const task = { data: JSON.stringify(MOCKED_TASK_CONTENT) };

    await bullService.downloadQueueWorker({ task, startTime, resolve, reject }, callback);

    expect(callback).not.toHaveBeenCalled();
    expect(resolve).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
    expect(etherscan.getBlock).not.toHaveBeenCalled();
  });

  it('should ignore tasks with null taskContent', async () => {
    const resolve = jest.fn();
    const reject = jest.fn();
    const callback = jest.fn();

    const etherscan = getNeverCalledEtherscanService();
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);
    const task = { data: JSON.stringify(null) };

    await bullService.downloadQueueWorker({ task, startTime, resolve, reject }, callback);

    expect(callback).not.toHaveBeenCalled(); // No callbacks called
    expect(resolve).not.toHaveBeenCalled(); // No resolve called
    expect(reject).not.toHaveBeenCalled(); // No reject called
    expect(etherscan.getBlock).not.toHaveBeenCalled();
  });
});
