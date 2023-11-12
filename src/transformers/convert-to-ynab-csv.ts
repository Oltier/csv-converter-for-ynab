import { TransactionCombinedAmount } from './types';
import { YnabTransaction } from '../outputs/ynab';
import moment from 'moment';
import { Transform, TransformOptions } from 'stream';
import Transformer from './transformerBase';

export class ConvertToYnabCsv extends Transform {
  constructor() {
    super({
      objectMode: true
    });
  }

  _transform(data: TransactionCombinedAmount, encoding: any, cb: (arg0: null, arg1: YnabTransaction) => void) {
    const outputDate = moment(data.date).format('MM/DD/YYYY');

    const res = {
      date: outputDate,
      payee: data.payee,
      memo: data.memo,
      amount: `${Math.floor(data.amount * 100) / 100}`
    } as YnabTransaction;

    cb(null, res);
  }
}

// @ts-ignore
function convertToYnabCsv() {
  return new Transformer({}, (data: TransactionCombinedAmount) => {
    const outputDate = moment(data.date).format('MM/DD/YYYY');

    return {
      date: outputDate,
      payee: data.payee,
      memo: data.memo,
      amount: `${Math.floor(data.amount * 100) / 100}`
    } satisfies YnabTransaction;
  });
}

// const convertToYnabCsv = transform<TransactionCombinedAmount, YnabTransaction>();

export default convertToYnabCsv;
