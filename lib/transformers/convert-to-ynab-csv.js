"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertToYnabCsv = void 0;
const moment_1 = __importDefault(require("moment"));
const stream_1 = require("stream");
// @ts-ignore
const transformer_cjs_1 = __importDefault(require("./transformer.cjs"));
class ConvertToYnabCsv extends stream_1.Transform {
    constructor() {
        super({
            objectMode: true
        });
    }
    _transform(data, encoding, cb) {
        const outputDate = (0, moment_1.default)(data.date).format('MM/DD/YYYY');
        const res = {
            date: outputDate,
            payee: data.payee,
            memo: data.memo,
            amount: `${Math.floor(data.amount * 100) / 100}`
        };
        cb(null, res);
    }
}
exports.ConvertToYnabCsv = ConvertToYnabCsv;
// @ts-ignore
function convertToYnabCsv() {
    return new transformer_cjs_1.default({}, (data) => {
        const outputDate = (0, moment_1.default)(data.date).format('MM/DD/YYYY');
        return {
            date: outputDate,
            payee: data.payee,
            memo: data.memo,
            amount: `${Math.floor(data.amount * 100) / 100}`
        };
    });
}
// const convertToYnabCsv = transform<TransactionCombinedAmount, YnabTransaction>();
exports.default = convertToYnabCsv;
