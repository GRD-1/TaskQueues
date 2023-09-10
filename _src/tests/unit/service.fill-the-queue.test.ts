import { Service } from '../../services/service';
import serviceProvider from '../../utils/service-provider.util';
import errorHandler from '../../errors/handler.error';
errorHandler.setErrorListener();

describe('service methods', () => {
  const service = serviceProvider.getService(Service);
  const fillTheQueue = service.fillTheQueue;

  describe('fillTheQueue method', () => {
    it('should return an array with a valid job', () => {
      const lastBlock = '0x100';
      const blocksAmount = 5;
      const queueFiller = jest.fn();
      const result = fillTheQueue(queueFiller, lastBlock, blocksAmount);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'download all blocks');
      expect(result[0]).toHaveProperty('task');
    });
  });
});
