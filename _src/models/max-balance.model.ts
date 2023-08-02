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

export interface DownloadTaskArgs {
  downloadNumber: number;
  blockNumberHex: string;
}

export type DownloadDataCallback = (a: number, b: string) => void;

export type DownloadWorker = (args: DownloadTaskArgs, callback: done) => Promise<void>;

export type ProcessWorker = (block: Block, callback: done) => Promise<void>;

export interface Data {
  addressBalances?: Account;
  maxAccount?: Account;
  amountOfTransactions?: number;
  loadingTime?: number;
  processTime?: number;
  error?: { message: string };
}

export interface ProcessedData extends Query, Data {}
