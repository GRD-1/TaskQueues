import { Block } from '../../../../models/max-balance.model';
import { EtherscanService } from '../../../../services/etherscan.service';
import { MOCKED_BLOCK } from './mocked-block';

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
