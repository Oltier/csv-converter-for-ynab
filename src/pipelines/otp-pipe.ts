import fs from 'fs';
import { parse, parser, stringifier, stringify } from 'csv';
import * as XLSX from 'xlsx';
import parseToTransaction from '../inputs/parse-to-transaction';
import convertToYnabCsv from '../outputs/convert-to-ynab-csv';
import { Readable } from 'stream';

export default function processOtpPipe(path: string): void {
  const xlsx = XLSX.readFile(path);
  const worksheet = xlsx.Sheets[xlsx.SheetNames[0]];

  const outputPath = `${process.cwd()}/outputs/otp-ynab.csv`;
  const writeStream = fs.createWriteStream(outputPath);

  writeStream.write('Date,Payee,Memo,Amount\n');

  const readStream: Readable = XLSX.stream.to_csv(worksheet, {
    FS: ';',
    strip: true,
    blankrows: false,
    skipHidden: false,
    rawNumbers: true
  });

  readStream
    .pipe(
      parse({
        delimiter: ';',
        trim: true,
        cast: true,
        castDate: true,
        columns: true
      } satisfies parser.Options)
    )
    .pipe(parseToTransaction)
    .pipe(convertToYnabCsv)
    .pipe(
      stringify({
        delimiter: ','
      } satisfies stringifier.Options)
    )
    .pipe(writeStream);
}
