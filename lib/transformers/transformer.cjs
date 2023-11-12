"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = __importDefault(require("stream"));
const util_1 = __importDefault(require("util"));
const Transformer = function (options = {}, handler) {
    this.options = options;
    if (options.consume === undefined || options.consume === null) {
        this.options.consume = false;
    }
    this.options.objectMode = true;
    if (options.parallel === undefined || options.parallel === null) {
        this.options.parallel = 100;
    }
    if (options.params === undefined || options.params === null) {
        options.params = null;
    }
    this.handler = handler;
    stream_1.default.Transform.call(this, this.options);
    this.state = {
        running: 0,
        started: 0,
        finished: 0,
        paused: false,
    };
    return this;
};
util_1.default.inherits(Transformer, stream_1.default.Transform);
Transformer.prototype._transform = function (chunk, _, cb) {
    this.state.started++;
    this.state.running++;
    // Accept additionnal chunks to be processed in parallel
    if (!this.state.paused && this.state.running < this.options.parallel) {
        cb();
        cb = null; // Cancel further callback execution
    }
    try {
        let l = this.handler.length;
        if (this.options.params !== null) {
            l--;
        }
        if (l === 1) { // sync
            const result = this.handler.call(this, chunk, this.options.params);
            if (result && result.then) {
                result.then((result) => {
                    this.__done(null, [result], cb);
                });
                result.catch((err) => {
                    this.__done(err);
                });
            }
            else {
                this.__done(null, [result], cb);
            }
        }
        else if (l === 2) { // async
            const callback = (err, ...chunks) => this.__done(err, chunks, cb);
            this.handler.call(this, chunk, callback, this.options.params);
        }
        else {
            throw Error('Invalid handler arguments');
        }
        return false;
    }
    catch (err) {
        this.__done(err);
    }
};
Transformer.prototype._flush = function (cb) {
    if (this.state.running === 0) {
        cb();
    }
    else {
        this._ending = function () {
            cb();
        };
    }
};
Transformer.prototype.__done = function (err, chunks, cb) {
    this.state.running--;
    if (err) {
        return this.destroy(err);
        // return this.emit('error', err);
    }
    this.state.finished++;
    for (let chunk of chunks) {
        if (typeof chunk === 'number') {
            chunk = `${chunk}`;
        }
        // We dont push empty string
        // See https://nodejs.org/api/stream.html#stream_readable_push
        if (chunk !== undefined && chunk !== null && chunk !== '') {
            this.state.paused = !this.push(chunk);
        }
    }
    // Chunk has been processed
    if (cb) {
        cb();
    }
    if (this._ending && this.state.running === 0) {
        this._ending();
    }
};
exports.default = Transformer;
