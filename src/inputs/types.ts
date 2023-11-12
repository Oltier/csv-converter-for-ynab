import { TransactionCombinedAmount } from '../transformers/types';

export type TransactionInput = Record<string, any>;
export type TransactionInputMapping = Partial<Record<keyof TransactionCombinedAmount, string | string[]>>;
export type SupportedInputFormat = 'xlsx' | 'csv';
