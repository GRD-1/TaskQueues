import { Block } from '../../../../../models/max-balance.model';
import { EtherscanService } from '../../../../../services/etherscan.service';

export const MOCKED_BLOCK: Block = {
  status: '1',
  result: {
    number: '0x4e3b7',
    transactions: [
      { blockNumber: 0x4e3b7, to: 'address1', from: 'address2', value: 10 },
      { blockNumber: 0x4e3b7, to: 'address2', from: 'address3', value: 5 },
    ],
  },
};

class MockedEtherscanService extends EtherscanService {
  async getBlock(blockNumberHex: string): Promise<Block> {
    return MOCKED_BLOCK;
  }
}

export function getMockedEtherscanService(): MockedEtherscanService {
  return new MockedEtherscanService();
}

class FailedEtherscanService extends EtherscanService {
  async getBlock(blockNumberHex: string): Promise<Block> {
    throw new Error('Etherscan error');
  }
}

export function getFailedEtherscanService(): FailedEtherscanService {
  return new FailedEtherscanService();
}

class NeverCalledEtherscanService extends EtherscanService {
  constructor() {
    super();
    this.getBlock = jest.fn();
  }
}

export function getNeverCalledEtherscanService(): NeverCalledEtherscanService {
  return new NeverCalledEtherscanService();
}
