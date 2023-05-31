// eslint-disable-next-line max-classes-per-file
export class QueueElement {
  constructor(public name: string, public previous: QueueElement | null, public next: QueueElement | null) {
    this.name = name;
    this.previous = null;
    this.next = null;
  }
}

type QueueMethod = QueueElement | null;

export class DoubleEndedQueue {
  constructor(public head: QueueMethod = null, public tail: QueueMethod = null) {}

  theQueueIsEmpty(element = null) {
    if (this.head === null || this.tail === null) {
      this.head = element;
      this.tail = element;
      return true;
    }
    return false;
  }

  theLastElement() {
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
      return true;
    }
    return false;
  }

  addToHead(element) {
    if (!this.theQueueIsEmpty(element)) {
      this.head.previous = element;
      element.next = this.head;
      this.head = element;
    }
  }

  addToTail(element) {
    if (!this.theQueueIsEmpty(element)) {
      this.tail.next = element;
      element.previous = this.tail;
      this.tail = element;
    }
  }

  removeFromHead() {
    if (!this.theLastElement()) {
      this.head = this.head.next;
      this.head.previous = null;
    }
  }

  removeFromTail() {
    if (!this.theLastElement()) {
      this.tail = this.tail.previous;
      this.tail.next = null;
    }
  }

  printList() {
    console.log('\n');
    let element = this.head;
    while (element) {
      console.log(element.name);
      element = element.next;
    }
  }
}
