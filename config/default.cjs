module.exports = {
  LOG_BENCHMARKS: false,
  WAITING_TIME_FOR_BLOCK: 1000,
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
    BLOCKS_AMOUNT: 3,
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
    get host(){
      return process.env.DOCKER_BUILD? 'rabbitmq' : 'localhost';
    },
    port: 5672,
  },

};
