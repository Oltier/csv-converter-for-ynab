import { transform, transformer } from 'csv';
import { TransactionCombinedAmount } from './types';
import moment from 'moment';
import ExchangeService from '../services/exchange-service';

const currencyExchange = (exchangeService: ExchangeService) =>
  transform<TransactionCombinedAmount, Promise<TransactionCombinedAmount>>(
    {
      params: {
        exchangeService
      }
    },
    async (data: TransactionCombinedAmount, cb, params) => {
      if (!data.currency || !('exchangeService' in params)) {
        // TODO I shouldn't have to call cb here... but hey... it works now
        cb(null, data);
        return data;
      }

      const formattedDate = moment(data.date).format('YYYY-MM-DD');
      const exchangeRatesByDate = await params.exchangeService.fetchRatesByDate(formattedDate);
      const exchangeRate = 1 / exchangeRatesByDate.rates.HUF / (1 / exchangeRatesByDate.rates.EUR);

      // -60,000 HUF (FX rate: 0.0026019) [rest of memo]
      const newMemo = `${data.amount} ${data.currency} (FX rate: ${exchangeRate.toPrecision(4)})${
        data.memo ? ` | ${data.memo}` : ''
      }`;
      const newAmount = data.amount * exchangeRate;

      const res = {
        ...data,
        memo: newMemo,
        amount: newAmount
      };

      cb(null, res);

      return res;
    }
  );

export default currencyExchange;
