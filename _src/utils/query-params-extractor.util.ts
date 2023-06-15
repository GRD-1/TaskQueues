import { Query } from '../models/max-balance.model';

async function getLastBlockNumber(query): Promise<string> {
  try {
    if (query.lastBlock) return query.lastBlock;
    const result = await fetch(process.env.etherscanAPILastBlockNumberRequest);
    const data = (await result.json()) as { result: string };
    return data.result;
  } catch (e) {
    console.error('Failed to get the last block number! reason: ', e);
    throw e;
  }
}

export default async function getQueryParams(query): Promise<Query> {
  const library = query.library || 'bull';
  const blocksAmount = query.blocksAmount || 10;
  const lastBlock = await getLastBlockNumber(query);
  return { library, blocksAmount, lastBlock };
}
