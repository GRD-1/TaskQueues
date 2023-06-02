import Queue from 'queue';
import { Block } from './block.model';

export class QueueWorker {
  blockNumber: string;
  value: Block;

  constructor(value: Block, blockNumber: string) {
    this.blockNumber = blockNumber;
    this.value = value;
  }

  handler(queue: Queue) {
    const previousResultIndex = queue.results.length > 1 ? queue.results.length - 2 : 0;
    const previousResult = queue.results[previousResultIndex];
    const result = queue.results.length > 1 ? +previousResult + 1 : 1;
    console.log('\nqueue.results.length: ', queue.results.length);
    console.log('queue.results:', queue.results);
    console.log('previousResultIndex = ', previousResultIndex);
    console.log('previousResult = ', previousResult);
    console.log('\nnew result: ', result);
    // console.log('\nqueue element: ', this.blockNumber);
    return result;
  }
}
