import { getMockedEtherscanService, getFailedEtherscanService } from '../__mocks__/mocked-etherscan-service';
import serviceProvider from '../../../../utils/service-provider.util';
import { FastqService } from '../../../../services/fastq.service';
import { MockedFastqService } from './__mocks__/mocked-fastq-service';
import { MOCKED_TASK_CONTENT } from '../__mocks__/mocked-task';

describe('downloadQueueWorker function', () => {
  const fastqService = new FastqService();
  fastqService.sessionKey = 99999;
  fastqService.blocksAmount = 1;
  fastqService.numberOfProcessedTasks = 10;
  let callback: typeof jest.fn;

  beforeEach(() => {
    callback = jest.fn();
  });

  it('should process a valid task and resolve when successful', async () => {
    const etherscan = getMockedEtherscanService();
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);
    const mockedFastqService = new MockedFastqService();

    await mockedFastqService.downloadQueueWorker(MOCKED_TASK_CONTENT, callback);

    expect(callback).toHaveBeenCalledWith(null);
  });

  it('should handle an invalid task and reject when etherscan.getBlock fails', async () => {
    const etherscan = getFailedEtherscanService();
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);

    await fastqService.downloadQueueWorker(MOCKED_TASK_CONTENT, callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error));
  });
});
