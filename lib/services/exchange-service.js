"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const DBClient_1 = __importDefault(require("../db/DBClient"));
const client_1 = require("../generated/client");
const lodash_1 = __importDefault(require("lodash"));
class ExchangeService {
    baseUrl = 'https://openexchangerates.org/api';
    // private readonly baseUrl = 'https://a235eca0-a1ed-41fb-b04b-1312dc983760.mock.pstmn.io/api';
    apiKey;
    fetch;
    cachedRates = {};
    static instance;
    constructor(props) {
        if (!props.apiKey) {
            throw new Error('Missing EXCHANGE_API_KEY environment variable');
        }
        this.apiKey = props.apiKey;
        this.fetch = props.fetch || fetch;
    }
    static getInstance() {
        if (!ExchangeService.instance) {
            ExchangeService.instance = new ExchangeService({
                apiKey: process.env.EXCHANGE_API_KEY
            });
        }
        return ExchangeService.instance;
    }
    async prePopulateCache(dateValues) {
        if ((Array.isArray(dateValues) && dateValues.length === 0) ||
            (dateValues instanceof Set && dateValues.size === 0)) {
            return this.cachedRates;
        }
        console.log(`Pre-populating exchange rate cache`);
        const rates = await DBClient_1.default.getInstance().currencyRateUsd.findMany({
            where: {
                date: {
                    in: Array.from(dateValues).map((date) => (0, moment_1.default)(date).format('YYYY-MM-DD'))
                }
            }
        });
        this.cachedRates = { ...this.cachedRates, ...lodash_1.default.keyBy(rates, (rate) => rate.date) };
        return this.cachedRates;
    }
    async pushToCache(dateString, json) {
        console.log(`Pushing exchange rates for ${dateString} to cache`);
        this.cachedRates[dateString] = json.rates;
        try {
            await DBClient_1.default.getInstance().currencyRateUsd.create({
                data: {
                    date: dateString,
                    ...json.rates
                }
            });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    console.log(`Record for ${dateString} is already in cache db, skipping`);
                }
                else {
                    console.info(`Couldn't write exchange info for ${dateString} to cache db, skipping`, e);
                }
            }
            else {
                console.info(`Couldn't write exchange info for ${dateString} to cache db, skipping`, e);
            }
        }
        return this.cachedRates;
    }
    async fetchRatesByDate(dateString) {
        if (this.cachedRates[dateString]) {
            console.log(`Using cached exchange rates for ${dateString}`);
            return Promise.resolve({
                timestamp: Date.now(),
                base: 'USD',
                rates: this.cachedRates[dateString],
                date: dateString
            });
        }
        const cachedDateFromDb = (await this.prePopulateCache([dateString]))[dateString];
        if (cachedDateFromDb) {
            console.log(`Using cached exchange rates from db for ${dateString}`);
            return Promise.resolve({
                timestamp: Date.now(),
                base: 'USD',
                rates: cachedDateFromDb,
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
            throw new Error(`Failed to fetch exchange rates for ${dateString}, response: ${response.status}, statusText: ${response.statusText}`);
        }
        const json = (await response.json());
        await this.pushToCache(dateString, json);
        return {
            ...json,
            date: dateString
        };
    }
}
exports.default = ExchangeService;
