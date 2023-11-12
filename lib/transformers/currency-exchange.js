"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csv_1 = require("csv");
const moment_1 = __importDefault(require("moment"));
const currencyExchange = (exchangeService, targetCurrency, defaultSourceCurrency) => (0, csv_1.transform)({
    params: {
        exchangeService
    }
}, async (data, cb, params) => {
    if ((!data.currency && !defaultSourceCurrency) || !('exchangeService' in params)) {
        // TODO I shouldn't have to call cb here... but hey... it works now
        cb(null, data);
        return data;
    }
    const formattedDate = (0, moment_1.default)(data.date).format('YYYY-MM-DD');
    const exchangeRatesByDate = await params.exchangeService.fetchRatesByDate(formattedDate);
    const exchangeRate = 1 / exchangeRatesByDate.rates[data.currency || defaultSourceCurrency] / (1 / exchangeRatesByDate.rates[targetCurrency]);
    // -60,000 HUF (FX rate: 0.0026019) [rest of memo]
    const newMemo = `${data.amount.toLocaleString()} ${data.currency || defaultSourceCurrency} (FX rate: ${exchangeRate.toPrecision(4)})${data.memo ? ` | ${data.memo}` : ''}`;
    const newAmount = data.amount * exchangeRate;
    const res = {
        ...data,
        memo: newMemo,
        amount: newAmount
    };
    cb(null, res);
    return res;
});
exports.default = currencyExchange;
