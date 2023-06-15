import fs from 'fs';
import { Account, Query } from '../models/max-balance.model';

function logBenchmarks(addressBalances: Account, maxAccount: Account, startTime: number) {
  const values: number[] = Object.values(addressBalances);
  values.sort((a, b) => b - a);
  console.log('\nexecution time = ', (Date.now() - startTime) / 1000);
  console.log(maxAccount);
  console.log('values.length', values.length);
  console.log(values);
}

export default async function balanceView(
  query: Query,
  addressBalances: Account,
  maxAccount: Account,
  startTime: number,
) {
  try {
    let html = fs.readFileSync(`${process.env.Project_ROOT}/static/max-balance.html`, 'utf8');
    const maxAccountData = Object.entries(maxAccount);
    const processingTime = (Date.now() - startTime) / 1000;
    html = html
      .replace('$library$', query.library)
      .replace('$lastBlock$', query.lastBlock)
      .replace('$blocksAmount$', String(query.blocksAmount))
      .replace('$address$', String(maxAccountData[0]))
      .replace('$finalBalance$', String(maxAccountData[1]))
      .replace('$processTime$', String(processingTime))
      .replace('$transactionNumber$', '????');

    if (process.env.logBenchmarks === 'true') logBenchmarks(addressBalances, maxAccount, processingTime);
    return html;
  } catch (err) {
    console.error('Error in view handler [getResults]: ', err);
    return err;
  }
}
