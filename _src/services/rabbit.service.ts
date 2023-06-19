import Bull from 'bull';
import queueSettings from '../config/bull';
const Queue = Bull;

export class BullService {
  constructor(public library) {}

  getQueue() {
    switch (this.library) {
      case 'bull':
        return Queue('queueName', queueSettings);
      case 'queue':
      case 'rabbit':
      default:
        // return new Fastq(fastQSettings);
        return Queue('queueName', queueSettings);
    }
  }
}
