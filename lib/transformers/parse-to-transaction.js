"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const transformer_cjs_1 = __importDefault(require("./transformer.cjs"));
const trimKeys = (obj) => Object.entries(obj).reduce((acc, [key, value]) => ({
    ...acc,
    [(0, lodash_1.trim)(key)]: value
}), {});
// function convertToYnabCsv(options) {
//   // @ts-ignore
//   return new transformer.Transformer(options, (data: TransactionCombinedAmount) => {
//     const outputDate = moment(data.date).format('MM/DD/YYYY');
//
//     return {
//       date: outputDate,
//       payee: data.payee,
//       memo: data.memo,
//       amount: `${Math.floor(data.amount * 100) / 100}`
//     } satisfies YnabTransaction;
//   });
// }
// @ts-ignore
function parseToTransaction(mapping) {
    return new transformer_cjs_1.default({
        params: {
            mapping
        }
    }, (data, cb, params) => {
        try {
            const trimmedData = trimKeys(data);
            const dataTrimmedKeys = Object.keys(trimmedData);
            const rawTransaction = Object.entries(mapping).reduce((acc, [transactionKey, maybeRawKeys]) => {
                const rawKeys = typeof maybeRawKeys === 'object' && 'fields' in maybeRawKeys ? maybeRawKeys.fields : maybeRawKeys;
                const mappingKeys = Array.isArray(rawKeys) ? rawKeys : [rawKeys];
                const trimmedMappingKeys = mappingKeys.map((key) => key.trim());
                const sourceKey = trimmedMappingKeys.find((key) => dataTrimmedKeys.includes(key) && !!trimmedData[key]);
                if (sourceKey) {
                    acc[transactionKey] = trimmedData[sourceKey];
                }
                else if (typeof maybeRawKeys === 'object' && 'default' in maybeRawKeys) {
                    acc[transactionKey] = maybeRawKeys.default;
                }
                return acc;
            }, {});
            const res = {
                date: parseDate(rawTransaction.date),
                payee: parsePayee(rawTransaction.payee),
                memo: typeof rawTransaction.memo === 'string' ? rawTransaction.memo.replace(/\s+/g, ' ') : '',
                amount: parseAmount(rawTransaction.amount, rawTransaction.inflow, rawTransaction.outflow),
                currency: rawTransaction.currency,
                accountNumber: `${rawTransaction.accountNumber}`
            };
            cb(null, res);
            return res;
        }
        catch (e) {
            console.error(JSON.stringify(data, null, 2));
            if (e instanceof Error) {
                cb(e);
            }
            throw e;
        }
    });
}
function parseAmount(maybeAmount, maybeInflow, maybeOutflow) {
    if (maybeAmount) {
        return parseNumber(maybeAmount);
    }
    else {
        if (maybeInflow) {
            return parseNumber(maybeInflow);
        }
        else {
            return parseNumber(maybeOutflow) * -1;
        }
    }
}
function parseNumber(maybeNumber) {
    if (typeof maybeNumber === 'number') {
        return maybeNumber;
    }
    if (typeof maybeNumber !== 'string') {
        throw new Error(`Could not parse amount: ${maybeNumber}`);
    }
    const trimmedAmount = maybeNumber.trim();
    const amountWithoutExtraCharacters = trimmedAmount.replace(/[^0-9.,\-]/g, '');
    const amount = parseFloat(amountWithoutExtraCharacters);
    if (isNaN(amount)) {
        throw new Error(`Could not parse amount: ${maybeNumber}`);
    }
    return amount;
}
function parseDate(maybeDate) {
    if (maybeDate instanceof Date) {
        return maybeDate;
    }
    if (typeof maybeDate !== 'string') {
        throw new Error(`Could not parse date: ${maybeDate}`);
    }
    const date = Date.parse(maybeDate);
    if (isNaN(date)) {
        throw new Error(`Could not parse date: ${maybeDate}`);
    }
    return new Date(date);
}
function parsePayee(maybePayee) {
    if (!maybePayee) {
        throw new Error(`Could not parse payee: ${maybePayee}`);
    }
    return maybePayee;
}
exports.default = parseToTransaction;
