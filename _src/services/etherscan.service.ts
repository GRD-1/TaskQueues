import config from 'config';
import { Block, Query } from '../models/max-balance.model';

export class EtherscanService {
  async getLastBlockNumber(query: Query): Promise<string> {
    try {
      if (!query.lastBlock) return config.DEFAULT_QUERY.LAST_BLOCK;
      if (query.lastBlock === 'last') {
        const request = `${config.ETHERSCAN_API.LAST_BLOCK_NUMBER}&apikey=${config.ETHERSCAN_APIKEY}`;
        const result = await fetch(request);
        const data = (await result.json()) as { result: string };
        return data.result;
      }
      return query.lastBlock;
    } catch (e) {
      console.error('Failed to get the last block number! reason: ', e);
      throw e;
    }
  }
  async getBlock(blockNumberDecimal: number): Promise<Block> {
    try {
      const blockNumber = blockNumberDecimal.toString(16);
      const request = `${config.ETHERSCAN_API.GET_BLOCK}&tag=${blockNumber}&apikey=${config.ETHERSCAN_APIKEY}`;
      const response = await fetch(request);
      return (await response.json()) as Block;
    } catch (e) {
      console.error('Failed to download a block data from https://etherscan.io/! reason: ', e);
      throw e;
    }
  }
}
