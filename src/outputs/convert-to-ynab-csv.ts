import { TransactionCombinedAmount } from '../transformers/types';
import { YnabTransaction } from './ynab';
import { transform } from 'csv';

const convertToYnabCsv = transform<TransactionCombinedAmount, YnabTransaction>((data: TransactionCombinedAmount) => {
  const outputDate = data.date.toLocaleDateString('en-US');

  return {
    date: outputDate,
    payee: data.payee,
    memo: data.memo,
    amount: `${data.amount}`
  } satisfies YnabTransaction;
});

export default convertToYnabCsv;
