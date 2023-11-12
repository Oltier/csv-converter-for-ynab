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
import { TransactionInput, TransactionInputMapping } from '../inputs/types';

// export const ersteMapping: TransactionInput = {
//   'Tranzakció dátuma és ideje': 'date',
//   'Partner név': 'payee',
//   Közlemény: 'memo',
//   Összeg: 'amount',
//   Devizanem: 'currency',
// }

export const ersteMapping: TransactionInputMapping = {
  'date': ['Tranzakció dátuma és ideje', 'Könyvelés dátuma'],
  'payee': {
    fields: 'Partner név',
    default: 'Erste Bank',
  },
  'memo': 'Közlemény',
  'amount': 'Összeg',
  'currency': 'Devizanem',
}

export default async function processErstePipe(path: string): Promise<void> {
  const exchangeRateService = ExchangeService.getInstance();

  const outputPath = `${process.cwd()}/outputs/erste-ynab.csv`;
  const writeStream = fs.createWriteStream(outputPath);

  writeStream.write('Date,Payee,Memo,Amount\n');

  const readStream: Readable = fs.createReadStream(path);

  return pipeline(
    readStream,
    parse({
      delimiter: ';',
      trim: true,
      cast: true,
      columns: true,
      quote: '"',
      bom: true,
    } satisfies parser.Options),
    parseToTransaction(ersteMapping),
    currencyExchange(exchangeRateService),
    convertToYnabCsv,
    stringify({
      delimiter: ','
    } satisfies stringifier.Options),
    writeStream
  );
}
