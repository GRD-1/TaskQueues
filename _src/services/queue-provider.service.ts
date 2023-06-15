import Bull from 'bull';
import bullSettings from '../config/bull';
import { Query } from '../models/max-balance.model';

export default class QueueProvider {
  constructor(public query: Query) {}

  getQueue() {
    switch (this.query?.library) {
      case 'bull':
        return Bull('queueName', bullSettings);
      case 'queue':
      case 'rabbit':
      default:
        // return new Fastq(fastQSettings);
        return Bull('queueName', bullSettings);
    }
  }
}
