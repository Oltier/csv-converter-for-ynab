"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpMapping = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_1 = require("csv");
const XLSX = __importStar(require("xlsx"));
const convert_to_ynab_csv_1 = __importDefault(require("../transformers/convert-to-ynab-csv"));
const promises_1 = require("stream/promises");
const exchange_service_1 = __importDefault(require("../services/exchange-service"));
const process = __importStar(require("process"));
const moment_1 = __importDefault(require("moment"));
exports.otpMapping = {
    date: 'Tranzakció dátuma',
    payee: 'Partner neve',
    memo: 'Közlemény',
    amount: 'Összeg',
    currency: 'Pénznem',
    accountNumber: 'Számla szám'
};
async function processOtpPipe(path) {
    const xlsx = XLSX.readFile(path);
    const worksheet = xlsx.Sheets[xlsx.SheetNames[0]];
    const dateValues = new Set();
    for (let cell in worksheet) {
        if (cell[0] === 'A' && cell !== 'A1') {
            // Assuming column A contains date values
            const dateValue = new Date(worksheet[cell].v);
            if (!isNaN(dateValue.getTime())) {
                dateValues.add((0, moment_1.default)(dateValue).format('YYYY-MM-DD'));
            }
        }
    }
    const exchangeRateService = exchange_service_1.default.getInstance();
    await exchangeRateService.prePopulateCache(dateValues);
    const outputPath = `${process.cwd()}/outputs/otp-ynab.csv`;
    const writeStream = fs_1.default.createWriteStream(outputPath);
    writeStream.write('Date,Payee,Memo,Amount\n');
    const readStream = XLSX.stream.to_csv(worksheet, {
        FS: ';',
        strip: true,
        blankrows: false,
        skipHidden: false,
        rawNumbers: true
    });
    return (0, promises_1.pipeline)(readStream, (0, csv_1.parse)({
        delimiter: ';',
        trim: true,
        cast: true,
        columns: true
    }), 
    // parseToTransaction(otpMapping),
    // TODO: Instead of dropping, try deduping somehow
    // filter((data: TransactionCombinedAmount) =>
    //   process.env.EXPECTED_ACCOUNT_NUMBER ? data.accountNumber === process.env.EXPECTED_ACCOUNT_NUMBER : true
    // ),
    // currencyExchange(exchangeRateService, 'EUR', 'HUF'),
    // @ts-ignore
    (0, convert_to_ynab_csv_1.default)(), (0, csv_1.stringify)({
        delimiter: ','
    }), writeStream);
}
exports.default = processOtpPipe;
