export interface Query {
  library: string;
  blocksAmount: number;
  lastBlock: string;
}

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

export interface Block {
  status: number | string | undefined;
  result: {
    number: string;
    transactions: Transaction[];
  };
}
