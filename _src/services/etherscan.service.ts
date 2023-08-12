import config from 'config';
import { Block } from '../models/max-balance.model';

export class EtherscanService {
  async getLastBlockNumber(): Promise<string> {
    try {
      const request = `${config.ETHERSCAN_API.LAST_BLOCK_NUMBER}&apikey=${config.ETHERSCAN_APIKEY}`;
      const result = await fetch(request);
      const data = (await result.json()) as { result: string };
      return data.result;
    } catch (e) {
      throw Error(`Error! Failed to get the last block number! reason: ${e.message}`);
    }
  }
  async getBlock(blockNumberHex: string): Promise<Block> {
    try {
      const request = `${config.ETHERSCAN_API.GET_BLOCK}&tag=${blockNumberHex}&apikey=${config.ETHERSCAN_APIKEY}`;
      let i = 1;
      let block: Block;
      while (i <= 5) {
        const response = await fetch(request);
        block = (await response.json()) as Block;
        if (block?.status === '0') i++;
        else break;
      }
      if (i > 5) throw new Error('Failed to retrieve block after multiple attempts.');
      if ('error' in block) {
        let errMsg = block.error.message;
        if (block.error.code === -32602) {
          errMsg = `Invalid block number [${blockNumberHex}] (incorrect hex)`;
        }
        throw Error(errMsg);
      }
      return block;
    } catch (e) {
      throw Error(`Error! Failed to retrieve block! reason: ${e.message}`);
    }
  }
}
