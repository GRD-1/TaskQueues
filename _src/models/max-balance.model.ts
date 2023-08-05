import { done } from 'fastq';

export interface Query {
  library?: string;
  blocksAmount?: number;
  lastBlock?: string;
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

export interface QueueTaskArgs {
  taskNumber: number;
  blockNumberHex: string;
  sessionKey?: number;
  content?: Block;
  terminateTask?: boolean;
}

export type DownloadQueueFiller = (args: QueueTaskArgs) => void;

export type TaskWorker = (args: QueueTaskArgs, callback: done) => Promise<void>;

export interface Data {
  addressBalances?: Account;
  maxAccount?: Account;
  amountOfTransactions?: number;
  loadingTime?: number;
  processTime?: number;
  error?: { message: string };
}

export interface ProcessedData extends Query, Data {}
