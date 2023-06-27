// eslint-disable-next-line import/no-unresolved
import { getDirname } from './config-functions';

export default function getVariables(): void {
  process.env.Project_ROOT = getDirname(`${import.meta.url}/../../`);

  // etherscan api
  const apikey = 'K1MEAS8TXKRNKIY54INFYGV57118D1JABP';
  const etherscanAPI = `https://api.etherscan.io/api?module=proxy&boolean=true&apikey=${apikey}`;
  process.env.etherscanAPIBlockRequest = `${etherscanAPI}&action=eth_getBlockByNumber`;
  process.env.etherscanAPILastBlockNumberRequest = `${etherscanAPI}&action=eth_blockNumber`;

  // default query params
  process.env.defaultLibrary = 'fastq';
  process.env.defaultBlocksAmount = '2';
  process.env.defaultLastBlock = '0x10b2feb';

  // log
  process.env.logBenchmarks = 'true';
}
