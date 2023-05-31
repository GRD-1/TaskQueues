export interface Transaction {
  blockNumber: number;
  from: string;
  to: string;
  value: number;
}
export interface Account {
  [address: string]: number;
}

export class MainModel {
  result: {
    transactions: Transaction[];
  };
}
