export function isFulfilled<T>(promise: PromiseSettledResult<T>): promise is PromiseFulfilledResult<T> {
    return promise.status === 'fulfilled';
}

export function isRejected(promise: PromiseSettledResult<unknown>): promise is PromiseRejectedResult {
    return promise.status === 'rejected';
}
