export interface Transaction {
  blockNumber: number;
  from: string;
  to: string;
  value: number;
}

export interface Account {
  [address: string]: number;
}

export interface ProcessedData {
  addressBalances: Account;
  maxAccount: Account;
}

export class Block {
  constructor(public blockNumber: string) {}
  status: number | string | undefined;
  result: {
    transactions: Transaction[];
  };
}
