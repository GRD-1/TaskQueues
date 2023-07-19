import config from 'config';
import { Query } from '../models/max-balance.model';

async function getLastBlockNumber(query): Promise<string> {
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

export default async function getQueryParams(query: Query): Promise<Query> {
  const library = query.library || config.DEFAULT_QUERY.LIBRARY;
  const blocksAmount = query.blocksAmount || config.DEFAULT_QUERY.BLOCKS_AMOUNT;
  const lastBlock = await getLastBlockNumber(query);
  return { library, blocksAmount, lastBlock };
}
