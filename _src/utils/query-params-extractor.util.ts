import { Query } from '../models/max-balance.model';

async function getLastBlockNumber(query): Promise<string> {
  try {
    if (!query.lastBlock) return process.env.defaultLastBlock;
    if (query.lastBlock === 'last') {
      const result = await fetch(process.env.etherscanAPILastBlockNumberRequest);
      const data = (await result.json()) as { result: string };
      return data.result;
    }
    return query.lastBlock;
  } catch (e) {
    console.error('Failed to get the last block number! reason: ', e);
    throw e;
  }
}

export default async function getQueryParams(query): Promise<Query> {
  const library = query.library || process.env.defaultLibrary;
  const blocksAmount = query.blocksAmount || process.env.defaultBlocksAmount;
  const lastBlock = await getLastBlockNumber(query);
  return { library, blocksAmount, lastBlock };
}
