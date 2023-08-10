import { done } from 'fastq';
import { DoneCallback } from 'bull';
import { Message } from 'amqplib';

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
  error?: { code: number; message: string };
}

export interface QueueTaskArgs {
  taskNumber: number;
  blockNumberHex: string;
  sessionKey?: number;
  content?: Block;
  terminateTask?: boolean;
}

export type DownloadQueueFiller = (args: QueueTaskArgs) => void;

export interface DownloadWorkerArgs {
  task: Message | null;
  startTime: number;
  resolve: (timeTaken: number) => void;
  reject: <T>(reason?: T) => void;
}

export interface ProcessWorkerArgs extends QueueTaskArgs {
  startTime: number;
  taskCallback: DoneCallback | done | null;
  resolve?: (timeTaken: number) => void;
  reject?: <T>(reason?: T) => void;
}

export interface Data {
  addressBalances?: Account;
  maxAccount?: Account;
  amountOfTransactions?: number;
  loadingTime?: number;
  processTime?: number;
  error?: string;
}

export interface ProcessedData extends Query, Data {}
