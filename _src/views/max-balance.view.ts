import fs from 'fs';
import config from 'config';
import { ProcessedData } from '../models/max-balance.model';

function logBenchmarks(args: ProcessedData): void {
  console.log('\nBenchmarks:');
  console.log('library:', args.library);
  console.log('lastBlock:', args.lastBlock);
  console.log('blocksAmount:', args.blocksAmount);
  console.log('max account:', args.maxAccountAddress);
  console.log('balance:', args.maxAccountBalanceChange);
  console.log('number of blocks:', args.blocksAmount);
  console.log('number of transactions:', args.amountOfTransactions);
  console.log('data loading time:', args.loadingTime);
  console.log('processing time:', args.processTime);
}

export default async function getBalanceView(args: ProcessedData): Promise<string> {
  try {
    if (args.error) return args.error;

    let html = fs.readFileSync(`${config.PROJECT_ROOT}/public/max-balance.html`, 'utf8');
    html = html
      .replace('$library$', args.library)
      .replace('$lastBlock$', args.lastBlock)
      .replace('$blocksAmount$', String(args.blocksAmount))
      .replace('$address$', String(args.maxAccountAddress))
      .replace('$finalBalance$', String(args.maxAccountBalanceChange))
      .replace('$blocksNumber$', String(args.blocksAmount))
      .replace('$transactionNumber$', String(args.amountOfTransactions))
      .replace('$loadingTime$', String(args.loadingTime))
      .replace('$processTime$', String(args.processTime));

    if (config.LOG_BENCHMARKS === true) logBenchmarks(args);
    return html;
  } catch (err) {
    console.error('Error in view handler [getResults]: ', err.message);
    return err.message;
  }
}
