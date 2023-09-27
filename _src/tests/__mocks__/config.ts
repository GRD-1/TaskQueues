export default {
  PROJECT_ROOT: __dirname.replace('/config', ''),
  LOG_BENCHMARKS: true,
  WAITING_TIME_FOR_BLOCK: 1500,
  LIBRARY_LIST: ['fastq', 'bull', 'rabbitmq'],

  ETHERSCAN_APIKEY: 'K1MEAS8TXKRNKIY54INFYGV57118D1JABP',
  ETHERSCAN_API: {
    ETHERSCAN: 'https://api.etherscan.io/api?module=proxy&boolean=true',
    get GET_BLOCK(): string {
      return `${this.ETHERSCAN}&action=eth_getBlockByNumber`;
    },
    get LAST_BLOCK_NUMBER(): string {
      return `${this.ETHERSCAN}&action=eth_blockNumber`;
    },
  },

  DEFAULT_QUERY: {
    LIBRARY: 'fastq',
    BLOCKS_AMOUNT: 3,
    LAST_BLOCK: '0x4e3b7',
    REQUEST_INTERVAL: 200,
  },

  REDIS: {
    get host(): string {
      return process.env.DOCKER_BUILD ? 'redis' : 'localhost';
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
      lockDuration: 3000,
      stalledInterval: 100,
      maxStalledCount: 10,
      guardInterval: 5000,
      retryProcessDelay: 10,
      drainDelay: 1000,
      backoff: {
        type: 'fixed',
        delay: 100,
      },
    },

    LIMITER: {
      max: 1000,
      duration: 3000,
      bounceBack: false,
    },
  },

  RABBIT: {
    get host(): string {
      return process.env.DOCKER_BUILD ? 'rabbitmq' : 'localhost';
    },
    port: 5672,
  },
};
