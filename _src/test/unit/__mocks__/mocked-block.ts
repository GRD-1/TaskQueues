import { Block } from '../../../models/max-balance.model';

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
