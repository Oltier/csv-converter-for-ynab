import fs from 'fs';
import { parse, parser, stringifier, stringify } from 'csv';
import * as XLSX from 'xlsx';
import parseToTransaction from '../transformers/parse-to-transaction';
import convertToYnabCsv from '../transformers/convert-to-ynab-csv';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import ExchangeService from '../services/exchange-service';
import * as process from 'process';
import moment from 'moment';
import currencyExchange from '../transformers/currency-exchange';
import _ from 'lodash';
import DBClient from '../db/DBClient';

export default async function processOtpPipe(path: string): Promise<void> {
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
  const [cachedDateValues] = await Promise.all([
    DBClient.getInstance().currencyRateUsd.findMany({
      select: {
        date: true,
        EUR: true,
        HUF: true
      },
      where: {
        date: {
          in: Array.from(dateValues).map((date) => moment(date).format('YYYY-MM-DD'))
        }
      }
    })
  ]);

  if (!process.env.EXCHANGE_API_KEY) {
    throw new Error('Missing EXCHANGE_API_KEY environment variable');
  }

  const exchangeRateService = new ExchangeService({
    apiKey: process.env.EXCHANGE_API_KEY
  });

  const datesToFetch = Array.from(dateValues).filter(
    (date) => !cachedDateValues.find((cachedDate: any) => cachedDate.date === date)
  );

  const newExchangeRates = await exchangeRateService.fetchAllRatesByDates(datesToFetch);
  await Promise.all(
    newExchangeRates.map((rate) =>
      DBClient.getInstance().currencyRateUsd.create({
        data: {
          date: moment(rate.date).format('YYYY-MM-DD'),
          ...rate.rates
        }
      })
    )
  );

  const exchangeRates = _.keyBy([...cachedDateValues, ...newExchangeRates], (rate) => rate.date);

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

  // TODO skip account numbers that don't match expected
  return pipeline(
    readStream,
    parse({
      delimiter: ';',
      trim: true,
      cast: true,
      columns: true
    } satisfies parser.Options),
    parseToTransaction,
    currencyExchange(exchangeRates),
    convertToYnabCsv,
    stringify({
      delimiter: ','
    } satisfies stringifier.Options),
    writeStream
  );
}
