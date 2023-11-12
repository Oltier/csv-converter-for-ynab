import { TransactionCombinedAmount } from './types';
import { TransactionInput, TransactionInputMapping, TransactionInputMappingConfig } from '../inputs/types';
import { transform } from 'csv';
import { trim } from 'lodash';

const trimKeys: (obj: Record<string, any>) => Record<string, any> = (obj: Record<string, any>) =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [trim(key)]: value
    }),
    {}
  );

const parseToTransaction = (mapping: TransactionInputMapping) =>
  transform<TransactionInput, TransactionCombinedAmount>(
    {
      params: {
        mapping
      }
    },
    (data: TransactionInput, cb, params) => {
      try {
        const trimmedData = trimKeys(data);
        const dataTrimmedKeys = Object.keys(trimmedData);
        const rawTransaction = Object.entries(mapping).reduce(
          (acc, [transactionKey, maybeRawKeys]: [string, string | string[] | TransactionInputMappingConfig]) => {
            const rawKeys =
              typeof maybeRawKeys === 'object' && 'fields' in maybeRawKeys ? maybeRawKeys.fields : maybeRawKeys;
            const mappingKeys = Array.isArray(rawKeys) ? rawKeys : [rawKeys];
            const trimmedMappingKeys = mappingKeys.map((key) => key.trim());
            const sourceKey = trimmedMappingKeys.find((key) => dataTrimmedKeys.includes(key) && !!trimmedData[key]);

            if (sourceKey) {
              acc[transactionKey as keyof TransactionCombinedAmount] = trimmedData[sourceKey];
            }

            if (typeof maybeRawKeys === 'object' && 'default' in maybeRawKeys) {
              acc[transactionKey as keyof TransactionCombinedAmount] = maybeRawKeys.default;
            }

            return acc;
          },
          {} as Record<keyof TransactionCombinedAmount, any>
        );

        const res = {
          date: parseDate(rawTransaction.date),
          payee: parsePayee(rawTransaction.payee),
          memo: typeof rawTransaction.memo === 'string' ? rawTransaction.memo.replace(/\s+/g, ' ') : '',
          amount: parseAmount(rawTransaction.amount),
          currency: rawTransaction.currency,
          accountNumber: `${rawTransaction.accountNumber}`
        } satisfies TransactionCombinedAmount;

        cb(null, res);

        return res;
      } catch (e) {
        console.error(JSON.stringify(data, null, 2));
        throw e;
      }
    }
  );

function parseAmount(maybeAmount: unknown): number {
  if (typeof maybeAmount === 'number') {
    return maybeAmount;
  }

  if (typeof maybeAmount !== 'string') {
    throw new Error(`Could not parse amount: ${maybeAmount}`);
  }

  const trimmedAmount = maybeAmount.trim();
  const amountWithoutExtraCharacters = trimmedAmount.replace(/[^0-9.,\-]/g, '');

  const amount = parseFloat(amountWithoutExtraCharacters);

  if (isNaN(amount)) {
    throw new Error(`Could not parse amount: ${maybeAmount}`);
  }

  return amount;
}

function parseDate(maybeDate: unknown): Date {
  if (maybeDate instanceof Date) {
    return maybeDate;
  }

  if (typeof maybeDate !== 'string') {
    throw new Error(`Could not parse date: ${maybeDate}`);
  }

  const date = Date.parse(maybeDate);

  if (isNaN(date)) {
    throw new Error(`Could not parse date: ${maybeDate}`);
  }

  return new Date(date);
}

function parsePayee(maybePayee: string | undefined) {
  if (!maybePayee) {
    throw new Error(`Could not parse payee: ${maybePayee}`);
  }
  return maybePayee;
}

export default parseToTransaction;
