import { Block } from './block.model';

export class QueueElement {
  public value: Block;
  public previous: QueueElement | null;
  public next: QueueElement | null;

  constructor(value: Block) {
    this.value = value;
    this.previous = null;
    this.next = null;
  }
}
