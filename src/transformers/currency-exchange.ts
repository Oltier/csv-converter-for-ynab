import { transform, transformer } from 'csv';
import { TransactionCombinedAmount } from './types';
import moment from 'moment';
import ExchangeService from '../services/exchange-service';
import { Currency } from '../types/currency';
import TransformerBase from './transformerBase';

function currencyExchange(
  exchangeService: ExchangeService,
  targetCurrency: Currency,
  defaultSourceCurrency?: Currency
) {
  return new TransformerBase<TransactionCombinedAmount, Promise<TransactionCombinedAmount>>(
    async (data: TransactionCombinedAmount, cb) => {
      if (!data.currency && !defaultSourceCurrency) {
        // TODO I shouldn't have to call cb here... but hey... it works now
        cb(null, Promise.resolve(data));
        return data;
      }

      const formattedDate = moment(data.date).format('YYYY-MM-DD');
      const exchangeRatesByDate = await exchangeService.fetchRatesByDate(formattedDate);
      const exchangeRate =
        1 /
        exchangeRatesByDate.rates[data.currency || defaultSourceCurrency!] /
        (1 / exchangeRatesByDate.rates[targetCurrency]);

      // -60,000 HUF (FX rate: 0.0026019) [rest of memo]
      const newMemo = `${data.amount.toLocaleString()} ${
        data.currency || defaultSourceCurrency
      } (FX rate: ${exchangeRate.toPrecision(4)})${data.memo ? ` | ${data.memo}` : ''}`;
      const newAmount = data.amount * exchangeRate;

      const res = {
        ...data,
        memo: newMemo,
        amount: newAmount
      };

      cb(null, Promise.resolve(res));

      return res;
    }
  );
}

export default currencyExchange;
