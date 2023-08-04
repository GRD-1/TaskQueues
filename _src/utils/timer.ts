import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import { Data } from '../models/max-balance.model';

export default function setTimer(awaitingTime: number): Promise<Data> {
  return new Promise((resolve) => {
    const scheduler = new ToadScheduler();
    const task = new Task('deadline', () => {
      console.log('\nsetTimer: game over!');
      resolve({ error: { message: `the waiting time has expired! (${awaitingTime} msec)` } });
      scheduler.stop();
    });
    const job = new SimpleIntervalJob({ milliseconds: awaitingTime, runImmediately: false }, task);
    scheduler.addSimpleIntervalJob(job);
  });
}
