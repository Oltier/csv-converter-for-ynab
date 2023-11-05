import { transform, transformer } from 'csv';
import { TransactionCombinedAmount } from './types';
import moment from 'moment';

const currencyExchange = (exchangeRates: any) =>
  transform<TransactionCombinedAmount, TransactionCombinedAmount>(
    {
      params: {
        exchangeRates
      }
    },
    (data: TransactionCombinedAmount, cb, params) => {
      if (!data.currency || !('exchangeRates' in params)) {
        return data;
      }

      const formattedDate = moment(data.date).format('YYYY-MM-DD');
      const exchangeRatesByDate = params.exchangeRates[formattedDate];
      const exchangeRate = 1 / exchangeRatesByDate.HUF / (1 / exchangeRatesByDate.EUR);

      // -60,000 HUF (FX rate: 0.0026019) [rest of memo]
      const newMemo = `${data.amount} ${data.currency} (FX rate: ${exchangeRate.toPrecision(4)}) ${data.memo})`;
      const newAmount = data.amount * exchangeRate;

      return {
        ...data,
        memo: newMemo,
        amount: newAmount
      };
    }
  );

export default currencyExchange;
