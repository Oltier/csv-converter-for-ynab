import {
  TransactionCombinedAmount,
  TransactionOutInAmount
} from '../transformers/types';

export type TransactionInput = Record<string, any>;
export type TransactionInputMappingConfig = {
  fields: string | string[];
  default?: string;
}
export type TransactionInputMapping = Partial<Record<keyof TransactionCombinedAmount | keyof TransactionOutInAmount, string | string[] | TransactionInputMappingConfig>>;
export type SupportedInputFormat = 'xlsx' | 'csv';
