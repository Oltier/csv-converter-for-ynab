import { transform } from 'csv';
import { TransactionCombinedAmount } from './types';

const filter = (pred: (data: TransactionCombinedAmount) => boolean) =>
  transform<TransactionCombinedAmount, TransactionCombinedAmount | null>(
    {
      params: {
        pred
      }
    },
    (data: TransactionCombinedAmount, cb, params) => {
      if (!('pred' in params) || !(typeof params.pred === 'function')) {
        cb(null, data);
        return data;
      }

      const res = params.pred(data) ? data : null;

      cb(null, res);

      return res;
    }
  );

export default filter;
