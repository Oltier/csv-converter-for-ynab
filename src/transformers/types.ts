type TransactionBase = {
  date: Date;
  payee: string;
  memo: string;
  currency?: string;
}

export type TransactionOutInAmount = TransactionBase & {
  outflow: number;
  inflow: number;
};


export type TransactionCombinedAmount = TransactionBase & {
  amount: number;
}

export type Transaction = TransactionOutInAmount | TransactionCombinedAmount;

export function isCombinedAmountTransaction(transaction: Transaction): transaction is TransactionCombinedAmount {
  return (transaction as TransactionCombinedAmount).amount !== undefined;
}
