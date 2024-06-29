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

  const rawTransactions = ersteExport.transactions.booked.concat(ersteExport.transactions.pending);
  rawTransactions.map<YnabTransaction>((ersteTransaction) => ({
    date: moment(ersteTransaction.bookingDate).format('MM/DD/YYYY'),
    payee: ersteTransaction.debtorName || 'Erste Bank',
    memo: ersteTransaction.remittanceInformationUnstructured,
    amount: ersteTransaction.transactionAmount.amount
  }))
    .forEach((ynabTransaction) => {
      writeStream.write(`${ynabTransaction.date},${ynabTransaction.payee},${ynabTransaction.memo},${ynabTransaction.amount}\n`);
    });
}
