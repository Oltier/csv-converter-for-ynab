import { TransactionCombinedAmount } from './types';
import { TransactionInput } from '../inputs/types';
import { transform } from 'csv';

const otpMapping: Record<string, keyof TransactionCombinedAmount> = {
  'Tranzakció dátuma': 'date',
  'Partner neve': 'payee',
  Közlemény: 'memo',
  Összeg: 'amount',
  Pénznem: 'currency'
};

const parseToTransaction = transform<TransactionInput, TransactionCombinedAmount>((data: TransactionInput) => {
  try {
    const rawTransaction = Object.keys(data).reduce(
      (acc, key) => {
        const trimmedKey = key.trim();
        const newKey = otpMapping[trimmedKey];

        if (newKey) {
          acc[newKey] = data[key];
        }

        return acc;
      },
      {} as Record<keyof TransactionCombinedAmount, any>
    );

    return {
      date: parseDate(rawTransaction.date),
      payee: rawTransaction.payee,
      memo: typeof rawTransaction.memo === 'string' ? rawTransaction.memo.replace(/\s+/g, ' ') : '',
      amount: parseAmount(rawTransaction.amount),
      currency: rawTransaction.currency
    } satisfies TransactionCombinedAmount;
  } catch (e) {
    console.error(JSON.stringify(data, null, 2));
    throw e;
  }
});

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

export default parseToTransaction;