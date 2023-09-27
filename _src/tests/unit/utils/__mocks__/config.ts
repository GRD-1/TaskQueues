export default {
  PROJECT_ROOT: __dirname.replace('/config', ''),
  LOG_BENCHMARKS: true,
  WAITING_TIME_FOR_BLOCK: 1500,
  LIBRARY_LIST: ['fastq', 'bull', 'rabbitmq'],

  DEFAULT_QUERY: {
    LIBRARY: 'fastq',
    BLOCKS_AMOUNT: 3,
    LAST_BLOCK: '0x4e3b7',
    REQUEST_INTERVAL: 200,
  },
};
