import { Block } from './block.model';

// export class QueueWorker {
//   blockNumber: string;
//   value: Block;
//
//   constructor(value: Block, blockNumber: string) {
//     this.blockNumber = blockNumber;
//     this.value = value;
//   }
//
//   handler(cb) {
//     console.log(this.blockNumber);
//     cb();
//   }
// }

type CB = <T>(err: T, val: Block) => { err; val };
export function QueueWorker(blockNumber: string, value: Block) {
  console.log('\nqueue element: ', blockNumber);
}

// const cb = (err, val) => ({ err, val });
// const block = new Block('blockNumber');
// const worker = new QueueWorker('blockNumber', block);
