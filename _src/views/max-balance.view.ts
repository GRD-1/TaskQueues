import fs from 'fs';
import { ProcessedData } from '../models/max-balance.model';

function logBenchmarks(args: ProcessedData, maxAccountData: [string, number]) {
  console.log('\nBenchmarks:');
  console.log('max account:', maxAccountData[0]);
  console.log('balance:', maxAccountData[1]);
  console.log('number of blocks:', args.blocksAmount);
  console.log('number of transactions:', args.amountOfTransactions);
  console.log('processing time:', args.processTime);
}

export default async function getBalanceView(args: ProcessedData) {
  try {
    if (args.error) {
      console.log(`${args.error.message}`);
      return args.error.message;
    }

    let html = fs.readFileSync(`${process.env.Project_ROOT}/public/max-balance.html`, 'utf8');
    const maxAccountData = Object.entries(args.maxAccount)[0];
    html = html
      .replace('$library$', args.library)
      .replace('$lastBlock$', args.lastBlock)
      .replace('$blocksAmount$', String(args.blocksAmount))
      .replace('$address$', String(maxAccountData[0]))
      .replace('$finalBalance$', String(maxAccountData[1]))
      .replace('$blocksNumber$', String(args.blocksAmount))
      .replace('$transactionNumber$', String(args.amountOfTransactions))
      .replace('$processTime$', String(args.processTime));

    if (process.env.logBenchmarks === 'true') logBenchmarks(args, maxAccountData);
    return html;
  } catch (err) {
    console.error('Error in view handler [getResults]: ', err);
    return err;
  }
}
