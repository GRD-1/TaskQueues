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
      throw new globalThis.SRV_ERROR(`Error! Failed to get the last block number! reason: ${e.message}`, e.message);
    }
  }

  async getBlock(blockNumberHex: string): Promise<Block> {
    const request = `${config.ETHERSCAN_API.GET_BLOCK}&tag=${blockNumberHex}&apikey=${config.ETHERSCAN_APIKEY}`;
    let retries = 5;
    let block: Block;
    while (retries > 0) {
      const response = await fetch(request).catch(() => {
        throw new globalThis.SRV_ERROR('Error! Failed to connect to etherscan.io. Check your internet connection');
      });
      block = (await response.json()) as Block;
      if (block?.status === '0') retries--;
      else break;
    }
    if ('error' in block) {
      let errMsg = `Error! Failed to retrieve block after multiple attempts. reason: ${block.error.message}`;
      if (block.error.code === -32602) {
        errMsg = `Error! Invalid block number [${blockNumberHex}] (incorrect hex)`;
      }
      throw new globalThis.SRV_ERROR(errMsg);
    }
    return block;
  }
}
