import redis from './redis';

const defaultJobOptions = {
  removeOnComplete: false,
  removeOnFail: false,
};

const settings = {
  lockDuration: 3000, // Key expiration time for job locks.
  stalledInterval: 100, // How often check for stalled jobs (use 0 for never checking).
  maxStalledCount: 10, // Max amount of times a stalled job will be re-processed.
  guardInterval: 5000, // Poll interval for delayed jobs and added jobs.
  retryProcessDelay: 10, // delay before processing next job in case of internal error.
  drainDelay: 1000, // A timeout for when the queue is in drained state (empty waiting for jobs).
  backoff: {
    type: 'fixed',
    delay: 100, // Initial delay duration in milliseconds
  },
};

const limiter = {
  max: 1000,
  duration: 3000,
  bounceBack: false,
};

export default { redis, defaultJobOptions, settings, limiter };
