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
exports.ersteMapping = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_1 = require("csv");
const convert_to_ynab_csv_1 = __importDefault(require("../transformers/convert-to-ynab-csv"));
const promises_1 = require("stream/promises");
const exchange_service_1 = __importDefault(require("../services/exchange-service"));
const process = __importStar(require("process"));
exports.ersteMapping = {
    date: ['Tranzakció dátuma és ideje', 'Könyvelés dátuma'],
    payee: {
        fields: 'Partner név',
        default: 'Erste Bank'
    },
    memo: 'Közlemény',
    amount: 'Összeg',
    currency: 'Devizanem'
};
async function processErstePipe(path) {
    const exchangeRateService = exchange_service_1.default.getInstance();
    const outputPath = `${process.cwd()}/outputs/erste-ynab.csv`;
    const writeStream = fs_1.default.createWriteStream(outputPath);
    writeStream.write('Date,Payee,Memo,Amount\n');
    const readStream = fs_1.default.createReadStream(path);
    return (0, promises_1.pipeline)(readStream, (0, csv_1.parse)({
        delimiter: ';',
        trim: true,
        cast: true,
        columns: true,
        quote: '"',
        bom: true
    }), 
    // parseToTransaction(ersteMapping),
    // currencyExchange(exchangeRateService, 'EUR', 'HUF'),
    // @ts-ignore
    (0, convert_to_ynab_csv_1.default)(), (0, csv_1.stringify)({
        delimiter: ','
    }), writeStream);
}
exports.default = processErstePipe;
