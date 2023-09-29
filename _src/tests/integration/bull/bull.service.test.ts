import { BullService } from '../../../services/bull.service';
import config from '../../__mocks__/config';
import errorHandler from '../../../errors/handler.error';
import { MOCKED_DATA } from './__mocks__/mocked-data';
errorHandler.setErrorListener();

jest.mock('config');

describe('integration bull service', () => {
  const queryParams = config.DEFAULT_QUERY;
  let bull: BullService;

  beforeEach(() => {
    bull = new BullService(queryParams.BLOCKS_AMOUNT, queryParams.LAST_BLOCK);
  });

  it('should return the correct data set', async () => {
    const data = await bull.getMaxChangedBalance();

    expect(data.amountOfTransactions).toEqual(MOCKED_DATA.amountOfTransactions);
    expect(data.maxAccountAddress).toEqual(MOCKED_DATA.maxAccountAddress);
    expect(data.maxAccountBalanceChange).toEqual(MOCKED_DATA.maxAccountBalanceChange);
    expect(data.error).toEqual(undefined);
  });

  // it('should throw an error when failed to connect to etherscan.io API', async () => {
  //   const data = await bull.getMaxChangedBalance();
  //
  //   expect(true).toEqual(true);
  // });
  //
  // it('should throw an error when the waiting time expired', async () => {
  //   const data = await bull.getMaxChangedBalance();
  //
  //   expect(false).toEqual(false);
  // });
});
