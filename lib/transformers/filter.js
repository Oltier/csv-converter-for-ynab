"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csv_1 = require("csv");
const filter = (pred) => (0, csv_1.transform)({
    params: {
        pred
    }
}, (data, cb, params) => {
    if (!('pred' in params) || !(typeof params.pred === 'function')) {
        cb(null, data);
        return data;
    }
    const res = params.pred(data) ? data : null;
    cb(null, res);
    return res;
});
exports.default = filter;
