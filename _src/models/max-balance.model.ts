export interface Query {
  library: string;
  blocksAmount: number;
  lastBlock: string;
}

export interface Account {
  [address: string]: number;
}

export interface Data {
  addressBalances: Account;
  maxAccount: Account;
  amountOfTransactions: number;
  processTime: number;
  error?: { message: string };
}

export interface ProcessedData extends Query, Data {}

export interface Transaction {
  blockNumber: number;
  from: string;
  to: string;
  value: number;
}

export interface Block {
  status: number | string | undefined;
  result: {
    number: string;
    transactions: Transaction[];
  };
}
