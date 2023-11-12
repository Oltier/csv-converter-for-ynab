import { TransactionCombinedAmount } from './types';
import Transformer from './transformerBase';

function filter(pred: (data: TransactionCombinedAmount) => boolean) {
  return new Transformer<TransactionCombinedAmount, TransactionCombinedAmount | null>(
    (data: TransactionCombinedAmount, cb) => {
      const res = pred(data) ? data : null;

      cb(null, res);

      return res;
    }
  );
}

export default filter;
