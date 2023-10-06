import config from 'config';
import { MOCKED_DATA } from './__mocks__/mocked-data';
import { getFailedEtherscanService, getNeverCalledEtherscanService } from '../__mocks__/mocked-etherscan-service';
import errorHandler from '../../errors/handler.error';
import { RabbitmqService } from '../../services/rabbitmq.service';
import serviceProvider from '../../utils/service-provider.util';
import { Data } from '../../models/max-balance.model';

errorHandler.setErrorListener();

describe('integration rabbitmq service', () => {
  const queryParams = config.DEFAULT_QUERY;
  let rabbitmqService: RabbitmqService;

  beforeEach(() => {
    rabbitmqService = new RabbitmqService(queryParams.BLOCKS_AMOUNT, queryParams.LAST_BLOCK);
  });

  it('should return the correct data set', async () => {
    const result = await rabbitmqService.getMaxChangedBalance();

    expect(result.amountOfTransactions).toEqual(MOCKED_DATA.amountOfTransactions);
    expect(result.maxAccountAddress).toEqual(MOCKED_DATA.maxAccountAddress);
    expect(result.maxAccountBalanceChange).toEqual(MOCKED_DATA.maxAccountBalanceChange);
    expect(result.error).toEqual(undefined);
  });

  // it('should throw an error when failed to connect to etherscan.io API', async () => {
  //   class MockedRabbitmqService extends RabbitmqService {
  //     setTimer(awaitingTime: number): Promise<Data> {
  //       return Promise.resolve({ error: 'the waiting time has expired' });
  //     }
  //   }
  //   rabbitmqService = new MockedRabbitmqService(queryParams.BLOCKS_AMOUNT, queryParams.LAST_BLOCK);
  //
  //   const result = await rabbitmqService.getMaxChangedBalance();
  //
  //   expect(result).toHaveProperty('error');
  // });

  // it('should throw an error when the waiting time expired', async () => {
  //   rabbitmqService.blocksAmount = 0;
  //   const result = await rabbitmqService.getMaxChangedBalance();
  //   console.log('\nrabbitmq.service.test result =', result);
  //
  //   expect(result).toHaveProperty('error');
  // });
});
