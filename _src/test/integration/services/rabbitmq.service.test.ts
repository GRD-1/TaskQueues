import config from 'config';
import { MOCKED_DATA } from '../__mocks__/mocked-calculation-result';
import errorHandler from '../../../errors/handler.error';
import { RabbitmqService } from '../../../services/rabbitmq.service';

errorHandler.setErrorListener();

describe('integration test of the "rabbitmq" service', () => {
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
});
