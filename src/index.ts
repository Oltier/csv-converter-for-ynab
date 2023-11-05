import fs from 'fs';
import { parse, parser, stringifier, stringify, transform } from 'csv';
import parseToTransaction from './inputs/parse-to-transaction';
import convertToYnabCsv from './outputs/convert-to-ynab-csv';

const writeStream = fs.createWriteStream(`${__dirname}/outputs/ynab.csv`);

writeStream.write('Date,Payee,Memo,Amount\n');

fs.createReadStream(`${__dirname}/examples/input/otp.csv`)
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
