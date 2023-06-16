import fs from 'fs';
import { Account, ProcessedData } from '../models/max-balance.model';

function logBenchmarks(addressBalances: Account, maxAccount: Account, processingTime: number) {
  const values: number[] = Object.values(addressBalances);
  values.sort((a, b) => b - a);
  console.log('\nexecution time = ', processingTime);
  console.log(maxAccount);
  console.log('values.length', values.length);
  console.log(values);
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
      .replace('$processTime$', String(processingTime))
      .replace('$transactionNumber$', String(args.amountOfTransactions));

    if (process.env.logBenchmarks === 'true') logBenchmarks(args.addressBalances, args.maxAccount, processingTime);
    return html;
  } catch (err) {
    console.error('Error in view handler [getResults]: ', err);
    return err;
  }
}
