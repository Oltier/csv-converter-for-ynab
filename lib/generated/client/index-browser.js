"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
const { Decimal, objectEnumValues, makeStrictEnum, Public, detectRuntime, } = require('./runtime/index-browser');
const Prisma = {};
exports.Prisma = Prisma;
exports.$Enums = {};
/**
 * Prisma Client JS version: 5.5.2
 * Query Engine version: aebc046ce8b88ebbcb45efe31cbe7d06fd6abc0a
 */
Prisma.prismaVersion = {
    client: "5.5.2",
    engine: "aebc046ce8b88ebbcb45efe31cbe7d06fd6abc0a"
};
Prisma.PrismaClientKnownRequestError = () => {
    throw new Error(`PrismaClientKnownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.PrismaClientUnknownRequestError = () => {
    throw new Error(`PrismaClientUnknownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.PrismaClientRustPanicError = () => {
    throw new Error(`PrismaClientRustPanicError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.PrismaClientInitializationError = () => {
    throw new Error(`PrismaClientInitializationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.PrismaClientValidationError = () => {
    throw new Error(`PrismaClientValidationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.NotFoundError = () => {
    throw new Error(`NotFoundError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.Decimal = Decimal;
/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
    throw new Error(`sqltag is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.empty = () => {
    throw new Error(`empty is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.join = () => {
    throw new Error(`join is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.raw = () => {
    throw new Error(`raw is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.validator = Public.validator;
/**
* Extensions
*/
Prisma.getExtensionContext = () => {
    throw new Error(`Extensions.getExtensionContext is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
Prisma.defineExtension = () => {
    throw new Error(`Extensions.defineExtension is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`);
};
/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull;
Prisma.JsonNull = objectEnumValues.instances.JsonNull;
Prisma.AnyNull = objectEnumValues.instances.AnyNull;
Prisma.NullTypes = {
    DbNull: objectEnumValues.classes.DbNull,
    JsonNull: objectEnumValues.classes.JsonNull,
    AnyNull: objectEnumValues.classes.AnyNull
};
/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
    Serializable: 'Serializable'
});
exports.Prisma.CurrencyRateUsdScalarFieldEnum = {
    id: 'id',
    date: 'date',
    AED: 'AED',
    AFN: 'AFN',
    ALL: 'ALL',
    AMD: 'AMD',
    ANG: 'ANG',
    AOA: 'AOA',
    ARS: 'ARS',
    AUD: 'AUD',
    AWG: 'AWG',
    AZN: 'AZN',
    BAM: 'BAM',
    BBD: 'BBD',
    BDT: 'BDT',
    BGN: 'BGN',
    BHD: 'BHD',
    BIF: 'BIF',
    BMD: 'BMD',
    BND: 'BND',
    BOB: 'BOB',
    BRL: 'BRL',
    BSD: 'BSD',
    BTC: 'BTC',
    BTN: 'BTN',
    BWP: 'BWP',
    BYN: 'BYN',
    BZD: 'BZD',
    CAD: 'CAD',
    CDF: 'CDF',
    CHF: 'CHF',
    CLF: 'CLF',
    CLP: 'CLP',
    CNH: 'CNH',
    CNY: 'CNY',
    COP: 'COP',
    CRC: 'CRC',
    CUC: 'CUC',
    CUP: 'CUP',
    CVE: 'CVE',
    CZK: 'CZK',
    DJF: 'DJF',
    DKK: 'DKK',
    DOP: 'DOP',
    DZD: 'DZD',
    EGP: 'EGP',
    ERN: 'ERN',
    ETB: 'ETB',
    EUR: 'EUR',
    FJD: 'FJD',
    FKP: 'FKP',
    GBP: 'GBP',
    GEL: 'GEL',
    GGP: 'GGP',
    GHS: 'GHS',
    GIP: 'GIP',
    GMD: 'GMD',
    GNF: 'GNF',
    GTQ: 'GTQ',
    GYD: 'GYD',
    HKD: 'HKD',
    HNL: 'HNL',
    HRK: 'HRK',
    HTG: 'HTG',
    HUF: 'HUF',
    IDR: 'IDR',
    ILS: 'ILS',
    IMP: 'IMP',
    INR: 'INR',
    IQD: 'IQD',
    IRR: 'IRR',
    ISK: 'ISK',
    JEP: 'JEP',
    JMD: 'JMD',
    JOD: 'JOD',
    JPY: 'JPY',
    KES: 'KES',
    KGS: 'KGS',
    KHR: 'KHR',
    KMF: 'KMF',
    KPW: 'KPW',
    KRW: 'KRW',
    KWD: 'KWD',
    KYD: 'KYD',
    KZT: 'KZT',
    LAK: 'LAK',
    LBP: 'LBP',
    LKR: 'LKR',
    LRD: 'LRD',
    LSL: 'LSL',
    LYD: 'LYD',
    MAD: 'MAD',
    MDL: 'MDL',
    MGA: 'MGA',
    MKD: 'MKD',
    MMK: 'MMK',
    MNT: 'MNT',
    MOP: 'MOP',
    MRU: 'MRU',
    MUR: 'MUR',
    MVR: 'MVR',
    MWK: 'MWK',
    MXN: 'MXN',
    MYR: 'MYR',
    MZN: 'MZN',
    NAD: 'NAD',
    NGN: 'NGN',
    NIO: 'NIO',
    NOK: 'NOK',
    NPR: 'NPR',
    NZD: 'NZD',
    OMR: 'OMR',
    PAB: 'PAB',
    PEN: 'PEN',
    PGK: 'PGK',
    PHP: 'PHP',
    PKR: 'PKR',
    PLN: 'PLN',
    PYG: 'PYG',
    QAR: 'QAR',
    RON: 'RON',
    RSD: 'RSD',
    RUB: 'RUB',
    RWF: 'RWF',
    SAR: 'SAR',
    SBD: 'SBD',
    SCR: 'SCR',
    SDG: 'SDG',
    SEK: 'SEK',
    SGD: 'SGD',
    SHP: 'SHP',
    SLL: 'SLL',
    SOS: 'SOS',
    SRD: 'SRD',
    SSP: 'SSP',
    STD: 'STD',
    STN: 'STN',
    SVC: 'SVC',
    SYP: 'SYP',
    SZL: 'SZL',
    THB: 'THB',
    TJS: 'TJS',
    TMT: 'TMT',
    TND: 'TND',
    TOP: 'TOP',
    TRY: 'TRY',
    TTD: 'TTD',
    TWD: 'TWD',
    TZS: 'TZS',
    UAH: 'UAH',
    UGX: 'UGX',
    USD: 'USD',
    UYU: 'UYU',
    UZS: 'UZS',
    VES: 'VES',
    VND: 'VND',
    VUV: 'VUV',
    WST: 'WST',
    XAF: 'XAF',
    XAG: 'XAG',
    XAU: 'XAU',
    XCD: 'XCD',
    XDR: 'XDR',
    XOF: 'XOF',
    XPD: 'XPD',
    XPF: 'XPF',
    XPT: 'XPT',
    YER: 'YER',
    ZAR: 'ZAR',
    ZMW: 'ZMW',
    ZWL: 'ZWL'
};
exports.Prisma.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.Prisma.ModelName = {
    CurrencyRateUsd: 'CurrencyRateUsd'
};
/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
    constructor() {
        return new Proxy(this, {
            get(target, prop) {
                const runtime = detectRuntime();
                const edgeRuntimeName = {
                    'workerd': 'Cloudflare Workers',
                    'deno': 'Deno and Deno Deploy',
                    'netlify': 'Netlify Edge Functions',
                    'edge-light': 'Vercel Edge Functions',
                }[runtime];
                let message = 'PrismaClient is unable to run in ';
                if (edgeRuntimeName !== undefined) {
                    message += edgeRuntimeName + '. As an alternative, try Accelerate: https://pris.ly/d/accelerate.';
                }
                else {
                    message += 'this browser environment, or has been bundled for the browser (running in `' + runtime + '`).';
                }
                message += `
If this is unexpected, please open an issue: https://github.com/prisma/prisma/issues`;
                throw new Error(message);
            }
        });
    }
}
exports.PrismaClient = PrismaClient;
Object.assign(exports, Prisma);
