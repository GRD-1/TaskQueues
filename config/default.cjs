module.exports = {
  LOG_BENCHMARKS: true,

  // etherscan api
  ETHERSCAN_API: {
    ETHERSCAN: 'https://api.etherscan.io/api?module=proxy&boolean=true',
    GET_BLOCK: `${this.ETHERSCAN}&action=eth_getBlockByNumber`,
    LAST_BLOCK_NUMBER: `${this.ETHERSCAN}&action=eth_blockNumber`,
  },

  // default query params
  DEFAULT_PARAMS: {
    LIBRARY: 'fastq',
    BLOCKS_AMOUNT: 2,
    LAST_BLOCK: '0x10b2feb',
  }
};
