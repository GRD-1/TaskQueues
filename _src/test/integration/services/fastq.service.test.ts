import config from 'config';
import { FastqService } from '../../../services/fastq.service';
import { MOCKED_DATA } from '../__mocks__/mocked-calculation-result';
import errorHandler from '../../../errors/handler.error';
errorHandler.setErrorListener();

describe('integration test of the "fastq" service', () => {
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
});
