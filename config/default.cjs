module.exports = {
  LOG_BENCHMARKS: true,
  WAITING_TIME_FOR_BLOCK: 1500,
  LIBRARY_LIST: ['fastq', 'bull', 'rabbitmq'],

  ETHERSCAN_API: {
    ETHERSCAN: 'https://api.etherscan.io/api?module=proxy&boolean=true',
    get GET_BLOCK(){
      return `${this.ETHERSCAN}&action=eth_getBlockByNumber`;
    },
    get LAST_BLOCK_NUMBER(){
      return `${this.ETHERSCAN}&action=eth_blockNumber`;
    },
  },

  DEFAULT_QUERY: {
    LIBRARY: 'fastq',
    BLOCKS_AMOUNT: 2,
    LAST_BLOCK: '0x10b2feb',
    REQUEST_INTERVAL: 200,
  },

  REDIS: {
    get host(){
        return process.env.DOCKER_BUILD? 'redis' : 'localhost';
    },
    port: 6379,
    maxRetriesPerRequest: null,
    connectTimeout: 180000,
  },

  BULL: {
    JOB_OPTIONS: {
      removeOnComplete: false,
      removeOnFail: false,
    },

    SETTINGS: {
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
    },

    LIMITER: {
      max: 1000,
      duration: 3000,
      bounceBack: false,
    },
  },

  RABBIT: {
    get host(){
      return process.env.DOCKER_BUILD? 'rabbitmq' : 'localhost';
    },
    port: 5672,
  },

};
