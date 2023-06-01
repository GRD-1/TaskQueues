import { Block } from './block.model';

export class QueueElement {
  public value: Block;
  public blockNumber: string;
  public previous: QueueElement | null;
  public next: QueueElement | null;

  constructor(value: Block, blockNumber: string) {
    this.value = value;
    this.blockNumber = blockNumber;
    this.previous = null;
    this.next = null;
  }
}
