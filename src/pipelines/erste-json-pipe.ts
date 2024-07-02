import process from 'process';
import fs from 'fs';
import { YnabTransaction } from '../outputs/ynab';
import moment from 'moment';

type TransactionAmount = {
  amount: string;
  currency: string;
}

type DebtorAccount = {
  pan: string;
}

type AdditionalInformation = 'OTHER' | 'BLOCK_RESERVE';

type ErsteTransaction = {
  transactionId: string;
  bookingDate: string;
  valueDate?: string;
  transactionAmount: TransactionAmount;
  debtorName?: string;
  debtorAccount?: DebtorAccount;
  remittanceInformationUnstructured: string;
  additionalInformation: AdditionalInformation;
}

type ErsteExport = {
  transactions: {
    booked: ErsteTransaction[];
    pending: ErsteTransaction[];
  }
}

export default async function processErsteJsonPipe(path: string): Promise<void> {
  const outputPath = `${process.cwd()}/outputs/erste-json-ynab.csv`;
  const writeStream = fs.createWriteStream(outputPath);

  const ersteExport: ErsteExport = JSON.parse(fs.readFileSync(path, 'utf8'));

  writeStream.write('Date,Payee,Memo,Amount\n');

  const lastReconciledDate = '2024-05-25';

  const rawTransactions = ersteExport.transactions.booked;
  rawTransactions
    .filter((ersteTransaction) => moment(ersteTransaction.valueDate).isSameOrAfter(lastReconciledDate))
    .map<YnabTransaction>((ersteTransaction) => ({
      date: moment(ersteTransaction.valueDate).format('MM/DD/YYYY'),
      payee: ersteTransaction.debtorName || 'Erste Bank',
      memo: ersteTransaction.remittanceInformationUnstructured,
      amount: ersteTransaction.transactionAmount.amount
    }))
    .forEach((ynabTransaction) => {
      writeStream.write(`${ynabTransaction.date},${ynabTransaction.payee},${ynabTransaction.memo},${ynabTransaction.amount}\n`);
    });

  const pendingTransactions = ersteExport.transactions.pending;

  const regex = /\s+([A-Z]{2,})\s+(.+)\sEredeti/;

  pendingTransactions
    .filter((ersteTransaction) => moment(ersteTransaction.valueDate).isSameOrAfter(lastReconciledDate))
    .map<YnabTransaction>((ersteTransaction) => {
      const maybeMatchCityAndSeller = ersteTransaction.remittanceInformationUnstructured.match(regex)
      return {
        date: moment(ersteTransaction.valueDate).format('MM/DD/YYYY'),
        payee: maybeMatchCityAndSeller ? maybeMatchCityAndSeller[2] : 'Unknown',
        memo: maybeMatchCityAndSeller ? `${maybeMatchCityAndSeller[1]} ${maybeMatchCityAndSeller[2]}` : '',
        amount: ersteTransaction.transactionAmount.amount
      };
    })
    .forEach((ynabTransaction) => {
      writeStream.write(`${ynabTransaction.date},${ynabTransaction.payee},${ynabTransaction.memo},${ynabTransaction.amount}\n`);
    });
}
