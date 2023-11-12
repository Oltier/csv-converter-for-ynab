"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRejected = exports.isFulfilled = void 0;
function isFulfilled(promise) {
    return promise.status === 'fulfilled';
}
exports.isFulfilled = isFulfilled;
function isRejected(promise) {
    return promise.status === 'rejected';
}
exports.isRejected = isRejected;
