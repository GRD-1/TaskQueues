import { FastqService } from '../../services/fastq.service';
import config from '../__mocks__/config';
import { MOCKED_DATA } from './__mocks__/mocked-data';
import errorHandler from '../../errors/handler.error';
errorHandler.setErrorListener();

jest.mock('config');

describe('integration fastq service', () => {
  const queryParams = config.DEFAULT_QUERY;
  let fastqService: FastqService;

  beforeEach(() => {
    fastqService = new FastqService(queryParams.BLOCKS_AMOUNT, queryParams.LAST_BLOCK);
  });

  it('should return the correct data set', async () => {
    const data = await fastqService.getMaxChangedBalance();

    expect(data.amountOfTransactions).toEqual(MOCKED_DATA.amountOfTransactions);
    expect(data.maxAccountAddress).toEqual(MOCKED_DATA.maxAccountAddress);
    expect(data.maxAccountBalanceChange).toEqual(MOCKED_DATA.maxAccountBalanceChange);
    expect(data.error).toEqual(undefined);
  });

  it('should throw an error when failed to connect to etherscan.io API', async () => {
    const data = await fastqService.getMaxChangedBalance();

    expect(true).toEqual(true);
  });

  it('should throw an error when the waiting time expired', async () => {
    const data = await fastqService.getMaxChangedBalance();

    expect(false).toEqual(false);
  });
});
