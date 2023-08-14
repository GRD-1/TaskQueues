import config from 'config';
import { Query } from '../models/max-balance.model';
import { EtherscanService } from '../services/etherscan.service';
const etherscan = new EtherscanService();

export default async function getQueryParams(query: Query): Promise<Query> {
  try {
    let { library, blocksAmount, lastBlock } = query;

    if (library === undefined) library = config.DEFAULT_QUERY.LIBRARY;
    else if (!config.LIBRARY_LIST.includes(query.library)) {
      throw Error('incorrect library name!');
    }

    if (blocksAmount === undefined) blocksAmount = config.DEFAULT_QUERY.BLOCKS_AMOUNT;
    else if (Number(blocksAmount) <= 0) throw Error('incorrect number of blocks!');
    else if (Number(blocksAmount) >= 20) throw Error('to much blocks! process will take a lot of time!');

    if (lastBlock === undefined) lastBlock = config.DEFAULT_QUERY.LAST_BLOCK;
    else if (query.lastBlock === 'last') lastBlock = await etherscan.getLastBlockNumber();
    else {
      const lastBlockNumberDecimal = parseInt(lastBlock, 16);
      if (lastBlockNumberDecimal < 2) throw Error('incorrect last block number! It supposed to be > 1');
    }

    return { library, blocksAmount, lastBlock };
  } catch (e) {
    e.message = `Error! ${e.message}`;
    globalThis.ERROR_EMITTER.emit('Error', e);
    return {};
  }
}
