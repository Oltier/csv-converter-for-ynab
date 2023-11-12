import fs from 'fs';
import { parse, parser, stringifier, stringify } from 'csv';
import * as XLSX from 'xlsx';
import parseToTransaction from '../transformers/parse-to-transaction';
import convertToYnabCsv from '../transformers/convert-to-ynab-csv';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import ExchangeService from '../services/exchange-service';
import * as process from 'process';
import currencyExchange from '../transformers/currency-exchange';
import moment from 'moment';
import { TransactionCombinedAmount } from '../transformers/types';
import filter from '../transformers/filter';
import { TransactionInputMapping } from '../inputs/types';

export const szepMapping: TransactionInputMapping = {
  date: 'Dátum',
  payee: 'Ellenoldali név',
  outflow: 'Terhelés',
  inflow: 'Jóváírás',
  currency: {
    fields: 'Pénznem',
    default: 'HUF'
  },
};

export default async function processSzepPipe(path: string): Promise<void> {
  const xlsx = XLSX.readFile(path);
  const worksheet = xlsx.Sheets[xlsx.SheetNames[0]];

  const dateValues: Set<string> = new Set();

  for (let cell in worksheet) {
    if (cell[0] === 'A' && cell !== 'A1') {
      // Assuming column A contains date values
      const dateValue = new Date(worksheet[cell].v);
      if (!isNaN(dateValue.getTime())) {
        dateValues.add(moment(dateValue).format('YYYY-MM-DD'));
      }
    }
  }

  const exchangeRateService = ExchangeService.getInstance();

  await exchangeRateService.prePopulateCache(dateValues);

  const outputPath = `${process.cwd()}/outputs/szep-ynab.csv`;
  const writeStream = fs.createWriteStream(outputPath);

  writeStream.write('Date,Payee,Memo,Amount\n');

  const readStream: Readable = XLSX.stream.to_csv(worksheet, {
    FS: ';',
    strip: true,
    blankrows: false,
    skipHidden: false,
    rawNumbers: true
  });

  return pipeline(
    readStream,
    parse({
      delimiter: ';',
      trim: true,
      cast: true,
      columns: true
    } satisfies parser.Options),
    parseToTransaction(szepMapping),
    currencyExchange(exchangeRateService),
    convertToYnabCsv,
    stringify({
      delimiter: ','
    } satisfies stringifier.Options),
    writeStream
  );
}
