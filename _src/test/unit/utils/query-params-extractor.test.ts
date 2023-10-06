import config from 'config';
import getQueryParams from '../../../utils/query-params-extractor.util';
import { getMockedEtherscanService } from '../__mocks__/mocked-etherscan-service';
import serviceProvider from '../../../utils/service-provider.util';
import errorHandler from '../../../errors/handler.error';
errorHandler.setErrorListener();
const etherscan = getMockedEtherscanService();

describe('unit util query-params-extractor', () => {
  it('should return default query parameters when query is empty', async () => {
    const query = {};
    const result = await getQueryParams(query);

    expect(result).toEqual({
      library: config.DEFAULT_QUERY.LIBRARY,
      blocksAmount: config.DEFAULT_QUERY.BLOCKS_AMOUNT,
      lastBlock: config.DEFAULT_QUERY.LAST_BLOCK,
    });
  });

  it('should override library parameter', async () => {
    const query = { library: 'bull' };
    const result = await getQueryParams(query);

    expect(result.library).toBe('bull');
  });

  it('should throw an error for an incorrect library name', async () => {
    const query = { library: 'invalid-library' };
    await expect(getQueryParams(query)).rejects.toThrow('incorrect library name!');
  });

  it('should override blocksAmount parameter', async () => {
    const query = { blocksAmount: 5 };
    const result = await getQueryParams(query);

    expect(result.blocksAmount).toBe(5);
  });

  it('should throw an error for a negative blocksAmount', async () => {
    const query = { blocksAmount: -1 };
    await expect(getQueryParams(query)).rejects.toThrow('incorrect number of blocks!');
  });

  it('should throw an error for too many blocks', async () => {
    const query = { blocksAmount: 25 };
    await expect(getQueryParams(query)).rejects.toThrow('too much blocks! the process will take a lot of time!');
  });

  it('should override lastBlock parameter with the last block number from Etherscan service', async () => {
    const query = { lastBlock: 'last' };
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);
    const result = await getQueryParams(query);

    expect(result.lastBlock).toBe('0x4e3b7');
  });

  it('should override lastBlock parameter with a valid hex number', async () => {
    const query = { lastBlock: '0x1234' };
    const result = await getQueryParams(query);

    expect(result.lastBlock).toBe('0x1234');
  });

  it('should throw an error for an invalid lastBlock value', async () => {
    const query = { lastBlock: 'invalid' };
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(etherscan);

    await expect(getQueryParams(query)).rejects.toThrow('incorrect last block number! It should be > 1');
  });
});
