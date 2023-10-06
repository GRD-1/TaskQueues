import config from 'config';
import { MOCKED_DATA } from './__mocks__/mocked-data';
import errorHandler from '../../errors/handler.error';
import { RabbitmqService } from '../../services/rabbitmq.service';

errorHandler.setErrorListener();

describe('integration rabbitmq service', () => {
  const queryParams = config.DEFAULT_QUERY;
  let rabbitmqService: RabbitmqService;

  beforeEach(() => {
    rabbitmqService = new RabbitmqService(queryParams.BLOCKS_AMOUNT, queryParams.LAST_BLOCK);
  });

  it('should return the correct data set', async () => {
    const data = await rabbitmqService.getMaxChangedBalance();

    expect(data.amountOfTransactions).toEqual(MOCKED_DATA.amountOfTransactions);
    expect(data.maxAccountAddress).toEqual(MOCKED_DATA.maxAccountAddress);
    expect(data.maxAccountBalanceChange).toEqual(MOCKED_DATA.maxAccountBalanceChange);
    expect(data.error).toEqual(undefined);
  });

  // it('should throw an error when failed to connect to etherscan.io API', async () => {
  //   const data = await rabbitmqService.getMaxChangedBalance();
  //
  //   expect(true).toEqual(true);
  // });

  // it('should throw an error when the waiting time expired', async () => {
  //   const data = await rabbitmqService.getMaxChangedBalance();
  //
  //   expect(false).toEqual(false);
  // });
});
