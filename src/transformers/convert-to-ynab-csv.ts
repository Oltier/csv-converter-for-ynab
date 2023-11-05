import { TransactionCombinedAmount } from './types';
import { YnabTransaction } from '../outputs/ynab';
import { transform } from 'csv';
import moment from 'moment';

const convertToYnabCsv = transform<TransactionCombinedAmount, YnabTransaction>((data: TransactionCombinedAmount) => {
  const outputDate = moment(data.date).format('MM/DD/YYYY');

  return {
    date: outputDate,
    payee: data.payee,
    memo: data.memo,
    amount: data.amount.toPrecision(2)
  } satisfies YnabTransaction;
});

export default convertToYnabCsv;
