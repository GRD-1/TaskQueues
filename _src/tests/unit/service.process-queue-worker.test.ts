// eslint-disable-next-line max-classes-per-file
import { Service } from '../../services/service';
import { Account, ProcessWorkerArgs } from '../../models/max-balance.model';
import errorHandler from '../../errors/handler.error';
errorHandler.setErrorListener();

describe('processQueueWorker function', () => {
  class ExtendedService extends Service {
    sessionKey = 12345;
    getMaxAccount = jest.fn(() => ({ address1: 10 }));
  }
  let extendedService: ExtendedService;
  let args: ProcessWorkerArgs;

  beforeEach(() => {
    extendedService = new ExtendedService();
    args = {
      taskNumber: 1,
      blockNumberHex: '0x4e3b7',
      sessionKey: 12345,
      content: {
        status: 200,
        result: {
          number: '0x4e3b7',
          transactions: [
            { blockNumber: 0x4e3b7, to: 'address1', from: 'address2', value: 10 },
            { blockNumber: 0x4e3b7, to: 'address2', from: 'address3', value: 5 },
          ],
        },
      },
      startTime: Date.now(),
      taskCallback: jest.fn(),
      resolve: jest.fn(),
      reject: jest.fn(),
    };
  });

  it('should process a block with transactions', async () => {
    await extendedService.processQueueWorker(args);

    expect(args.taskCallback).toHaveBeenCalledWith(null);
    expect(extendedService.addressBalances).toEqual({
      address1: 10,
      address2: -5,
      address3: -5,
    });
    expect(extendedService.amountOfTransactions).toBe(2);
    expect({ address1: 10 }).toEqual({ address1: 10 });
  });

  it('should handle empty content', async () => {
    args.content = null;
    await extendedService.processQueueWorker(args);

    expect(extendedService.addressBalances).toEqual(undefined);
    expect(extendedService.amountOfTransactions).toBe(0);
    expect(extendedService.maxAccount).toEqual(undefined);
  });

  it('should handle exceptions', async () => {
    const mockError = new Error('Test error');
    class RetryExtendedService extends Service {
      sessionKey = 12345;
      getMaxAccount(...ar: Account[]): Account {
        throw mockError;
      }
    }
    const retryExtendedService = new RetryExtendedService();
    await retryExtendedService.processQueueWorker(args);

    expect(args.taskCallback).toHaveBeenCalledWith(mockError);
    expect(args.reject).toHaveBeenCalledWith(mockError);
  });
});
