import { TransactionCombinedAmount } from './types';
import { YnabTransaction } from '../outputs/ynab';
import moment from 'moment';
import Transformer from './transformerBase';

function convertToYnabCsv() {
  return new Transformer<Promise<TransactionCombinedAmount>, Promise<YnabTransaction>>(async (dataPromise: Promise<TransactionCombinedAmount>) => {
    const data = await dataPromise;
    const outputDate = moment(data.date).format('MM/DD/YYYY');

    return {
      date: outputDate,
      payee: data.payee,
      memo: data.memo,
      amount: `${Math.floor(data.amount * 100) / 100}`
    } satisfies YnabTransaction;
  });
}

export default convertToYnabCsv;
