"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCombinedAmountTransaction = void 0;
function isCombinedAmountTransaction(transaction) {
    return transaction.amount !== undefined;
}
exports.isCombinedAmountTransaction = isCombinedAmountTransaction;
