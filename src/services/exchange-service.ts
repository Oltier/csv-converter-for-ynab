import { Currency } from '../types/currency';
import { isFulfilled, isRejected } from '../utils/promise-utils';
import moment from 'moment';
import DBClient from '../db/DBClient';
import { CurrencyRateUsd, Prisma } from '../generated/client';
import _ from 'lodash';

export type ExchangeServiceProps = {
  apiKey?: string;
  fetch?: typeof fetch;
};

type ExchangeRatesResponse = {
  timestamp: number;
  base: Currency;
  rates: Record<Currency, number>;
};

export type Rates = ExchangeRatesResponse & {
  date: string;
};

export default class ExchangeService {
  private readonly baseUrl = 'https://openexchangerates.org/api';
  // private readonly baseUrl = 'https://a235eca0-a1ed-41fb-b04b-1312dc983760.mock.pstmn.io/api';
  private readonly apiKey: string;
  private readonly fetch: typeof fetch;
  private cachedRates: Record<string, Omit<CurrencyRateUsd, 'id' | 'date'>> = {};
  private static instance: ExchangeService;

  private constructor(props: ExchangeServiceProps) {
    if (!props.apiKey) {
      throw new Error('Missing EXCHANGE_API_KEY environment variable');
    }

    this.apiKey = props.apiKey;
    this.fetch = props.fetch || fetch;
  }

  public static getInstance(): ExchangeService {
    if (!ExchangeService.instance) {
      ExchangeService.instance = new ExchangeService({
        apiKey: process.env.EXCHANGE_API_KEY
      });
    }
    return ExchangeService.instance;
  }

  public async prePopulateCache(dateValues: string[] | Set<string>) {
    if (
      (Array.isArray(dateValues) && dateValues.length === 0) ||
      (dateValues instanceof Set && dateValues.size === 0)
    ) {
      return this.cachedRates;
    }

    console.log(`Pre-populating exchange rate cache`);

    const rates = await DBClient.getInstance().currencyRateUsd.findMany({
      where: {
        date: {
          in: Array.from(dateValues).map((date) => moment(date).format('YYYY-MM-DD'))
        }
      }
    });
    this.cachedRates = { ...this.cachedRates, ..._.keyBy(rates, (rate) => rate.date) };
    return this.cachedRates;
  }

  private async pushToCache(dateString: string, json: ExchangeRatesResponse) {
    console.log(`Pushing exchange rates for ${dateString} to cache`);
    this.cachedRates[dateString] = json.rates;
    try {
      await DBClient.getInstance().currencyRateUsd.create({
        data: {
          date: dateString,
          ...json.rates
        }
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          console.log(`Record for ${dateString} is already in cache db, skipping`);
        } else {
          console.info(`Couldn't write exchange info for ${dateString} to cache db, skipping`, e);
        }
      } else {
        console.info(`Couldn't write exchange info for ${dateString} to cache db, skipping`, e);
      }
    }
    return this.cachedRates;
  }

  public async fetchRatesByDate(dateString: string): Promise<Rates> {
    if (this.cachedRates[dateString]) {
      console.log(`Using cached exchange rates for ${dateString}`);
      return Promise.resolve({
        timestamp: Date.now(),
        base: 'USD',
        rates: this.cachedRates[dateString],
        date: dateString
      });
    }
    const queryParams = {
      app_id: this.apiKey
    };
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${this.baseUrl}/historical/${dateString}.json?${queryString}`;
    console.log(`Fetching exchange rates for ${dateString}`);
    const response = await this.fetch(url);

    if (!response.ok) {
      console.error(response.headers);
      throw new Error(
        `Failed to fetch exchange rates for ${dateString}, response: ${response.status}, statusText: ${response.statusText}`
      );
    }

    const json = (await response.json()) as ExchangeRatesResponse;

    await this.pushToCache(dateString, json);

    return {
      ...json,
      date: dateString
    };
  }
}
