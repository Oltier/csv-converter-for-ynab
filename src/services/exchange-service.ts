import { Currency } from '../types/currency';
import { isFulfilled, isRejected } from '../utils/promise-utils';
import moment from 'moment';

export type ExchangeServiceProps = {
  apiKey: string;
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

  constructor(props: ExchangeServiceProps) {
    this.apiKey = props.apiKey;
    this.fetch = props.fetch || fetch;
  }

  public async fetchAllRatesByDates(dates: string[] | Date[]): Promise<Rates[]> {
    const promises = dates.map((date) => this.fetchRatesByRate(date));
    const results = await Promise.allSettled(promises);
    results.filter(isRejected).forEach((res) => console.error(res.reason));
    return results.filter(isFulfilled).map((result) => result.value);
  }

  public async fetchRatesByRate(date: string | Date): Promise<Rates> {
    const queryParams = {
      app_id: this.apiKey
    };
    const dateString = moment(date).format('YYYY-MM-DD');
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${this.baseUrl}/historical/${dateString}.json?${queryString}`;
    console.log(`Fetching exchange rates for ${dateString}`);
    const response = await this.fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch exchange rates for ${dateString}, response: ${response.status}, statusText: ${response.statusText}`
      );
    }

    const json = (await response.json()) as ExchangeRatesResponse;
    return {
      ...json,
      date: dateString
    };
  }
}
