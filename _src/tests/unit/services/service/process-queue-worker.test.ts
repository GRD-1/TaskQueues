// eslint-disable-next-line max-classes-per-file
import { Service } from '../../../../services/service';
import { Account, ProcessWorkerArgs } from '../../../../models/max-balance.model';
import errorHandler from '../../../../errors/handler.error';
import { MOCKED_TASK_CONTENT } from '../__mocks__/mocked-task';
errorHandler.setErrorListener();

describe('unit service.processQueueWorker', () => {
  let service: Service;
  let args: ProcessWorkerArgs;

  beforeEach(() => {
    service = new Service();
    service.sessionKey = 99999;
    args = {
      ...MOCKED_TASK_CONTENT,
      startTime: Date.now(),
      taskCallback: jest.fn(),
      resolve: jest.fn(),
      reject: jest.fn(),
    };
  });

  it('should process a block with transactions', async () => {
    await service.processQueueWorker(args);

    expect(args.taskCallback).toHaveBeenCalledWith(null);
    expect(service.addressBalances).toEqual({
      address1: 10,
      address2: -5,
      address3: -5,
    });
    expect(service.amountOfTransactions).toBe(2);
    expect({ address1: 10 }).toEqual({ address1: 10 });
  });

  it('should handle empty content', async () => {
    args.content = null;
    await service.processQueueWorker(args);

    expect(service.addressBalances).toEqual(undefined);
    expect(service.amountOfTransactions).toBe(0);
    expect(service.maxAccount).toEqual(undefined);
  });

  it('should handle exceptions', async () => {
    const mockError = new Error('Test error');
    class ServiceWithException extends Service {
      sessionKey = 99999;
      getMostChangedAccount(...ar: Account[]): Account {
        throw mockError;
      }
    }
    const serviceWithException = new ServiceWithException();
    await serviceWithException.processQueueWorker(args);

    expect(args.taskCallback).toHaveBeenCalledWith(mockError);
    expect(args.reject).toHaveBeenCalledWith(mockError);
  });
});
