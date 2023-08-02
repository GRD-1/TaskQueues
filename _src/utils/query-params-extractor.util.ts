import config from 'config';
import { Query } from '../models/max-balance.model';
import { EtherscanService } from '../services/etherscan.service';
const etherscan = new EtherscanService();

export default async function getQueryParams(query: Query): Promise<Query> {
  const library = query.library || config.DEFAULT_QUERY.LIBRARY;
  const blocksAmount = query.blocksAmount || config.DEFAULT_QUERY.BLOCKS_AMOUNT;
  const lastBlock = await etherscan.getLastBlockNumber(query);
  return { library, blocksAmount, lastBlock };
}
