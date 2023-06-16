import fs from 'fs';
import { Account, ProcessedData } from '../models/max-balance.model';

function logBenchmarks(args: ProcessedData, maxAccountData: [string, number], processingTime: number) {
  console.log('\nBenchmarks:');
  console.log('max account', maxAccountData[0]);
  console.log('balance', maxAccountData[1]);
  console.log('number of blocks', args.blocksAmount);
  console.log('number of transactions', args.amountOfTransactions);
  console.log('execution time = ', processingTime);
  // const values: number[] = Object.values(args.addressBalances);
  // values.sort((a, b) => b - a);
  // console.log(values);
}

export default async function getBalanceView(args: ProcessedData) {
  try {
    let html = fs.readFileSync(`${process.env.Project_ROOT}/public/max-balance.html`, 'utf8');
    const maxAccountData = Object.entries(args.maxAccount)[0];
    const processingTime = (Date.now() - args.startTime) / 1000;
    html = html
      .replace('$library$', args.library)
      .replace('$lastBlock$', args.lastBlock)
      .replace('$blocksAmount$', String(args.blocksAmount))
      .replace('$address$', String(maxAccountData[0]))
      .replace('$finalBalance$', String(maxAccountData[1]))
      .replace('$blocksNumber$', String(args.blocksAmount))
      .replace('$transactionNumber$', String(args.amountOfTransactions))
      .replace('$processTime$', String(processingTime));

    if (process.env.logBenchmarks === 'true') logBenchmarks(args, maxAccountData, processingTime);
    return html;
  } catch (err) {
    console.error('Error in view handler [getResults]: ', err);
    return err;
  }
}
