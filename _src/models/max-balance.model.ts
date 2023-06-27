export interface Query {
  library: string;
  blocksAmount: number;
  lastBlock: string;
}

export interface Account {
  [address: string]: number;
}

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
  downloadNumber?: number;
}

export interface DownloadWorker {
  downloadNumber: number;
  blockNumberHex: string;
}

export interface Data {
  addressBalances?: Account;
  maxAccount?: Account;
  amountOfTransactions?: number;
  loadingTime?: number;
  processTime?: number;
  error?: { message: string };
}

export interface ProcessedData extends Query, Data {}
