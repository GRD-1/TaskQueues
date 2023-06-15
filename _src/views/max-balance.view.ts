import fs from 'fs';
import { Account } from '../models/block.model';

function logBenchmarks(addressBalances: Account, maxAccount: Account, startTime: number) {
  const values: number[] = Object.values(addressBalances);
  values.sort((a, b) => b - a);
  console.log('\nexecution time = ', (Date.now() - startTime) / 1000);
  console.log(maxAccount);
  console.log('values.length', values.length);
  console.log(values);
}

export async function getResults(addressBalances, maxAccount, startTime) {
  try {
    const html = fs.readFileSync('/Users/flavio/test.txt');
    const processingTime = Date.now() - startTime / 1000;
    if (process.env.logBenchmarks === 'true') logBenchmarks(addressBalances, maxAccount, processingTime);
    return html;
  } catch (err) {
    console.error('Error in view handler [getResults]: ', err);
  }
}
