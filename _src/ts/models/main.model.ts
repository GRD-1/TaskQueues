interface transaction {
  blockNumber: number;
  from: string;
  to: string;
  value: number;
}

export class MainModel {
  result: {
    transactions: transaction[];
  };
}
