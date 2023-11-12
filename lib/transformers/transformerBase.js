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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformer = exports.transform = void 0;
const stream = __importStar(require("stream"));
class Transformer extends stream.Transform {
    handler;
    state;
    constructor(options = {}, handler) {
        super(options);
        this.handler = handler;
        this.options = options;
        if (this.options.consume === undefined || this.options.consume === null) {
            this.options.consume = false;
        }
        this.options.objectMode = true;
        if (this.options.parallel === undefined || this.options.parallel === null) {
            this.options.parallel = 100;
        }
        if (this.options.params === undefined || this.options.params === null) {
            this.options.params = null;
        }
        this.state = {
            running: 0,
            started: 0,
            finished: 0,
            paused: false,
        };
    }
    _transform(chunk, _, cb) {
        this.state.started++;
        this.state.running++;
        // Accept additional chunks to be processed in parallel
        if (!this.state.paused && this.state.running < this.options.parallel) {
            cb();
            cb = () => { }; // Cancel further callback execution
        }
        try {
            let l = this.handler.length;
            if (this.options.params !== null) {
                l--;
            }
            if (l === 1) {
                // sync
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
            else if (l === 2) {
                // async
                const callback = (err, ...chunks) => this.__done(err, chunks, cb);
                this.handler.call(this, chunk, callback, this.options.params);
            }
            else {
                throw new Error('Invalid handler arguments');
            }
        }
        catch (err) {
            this.__done(err);
        }
    }
    _flush(cb) {
        if (this.state.running === 0) {
            cb();
        }
        else {
            this._ending = () => {
                cb();
            };
        }
    }
    _ending;
    __done(err, chunks, cb) {
        this.state.running--;
        if (err) {
            return this.destroy(err);
        }
        this.state.finished++;
        for (const chunk of chunks) {
            if (typeof chunk === 'number') {
                chunk = `${chunk}`;
            }
            // We don't push an empty string
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
    }
}
exports.Transformer = Transformer;
const transform = function (...args) {
    let options = {};
    let callback, handler, records;
    for (let i = 0; i < args.length; i++) {
        const argument = args[i];
        let type = typeof argument;
        if (argument === null) {
            type = 'null';
        }
        else if (type === 'object' && Array.isArray(argument)) {
            type = 'array';
        }
        if (type === 'array') {
            records = argument;
        }
        else if (type === 'object') {
            options = { ...argument };
        }
        else if (type === 'function') {
            if (handler && i === args.length - 1) {
                callback = argument;
            }
            else {
                handler = argument;
            }
        }
        else if (type !== 'null') {
            throw new Error(`Invalid Arguments: got ${JSON.stringify(argument)} at position ${i}`);
        }
    }
    const transformer = new Transformer(options, handler);
    let error = false;
    if (records) {
        const writer = function () {
            for (const record of records) {
                if (error)
                    break;
                transformer.write(record);
            }
            transformer.end();
        };
        // Support Deno, Rollup doesn't provide a shim for setImmediate
        if (typeof setImmediate === 'function') {
            setImmediate(writer);
        }
        else {
            setTimeout(writer, 0);
        }
    }
    if (callback || options.consume) {
        const result = [];
        transformer.on('readable', function () {
            let record;
            while ((record = transformer.read()) !== null) {
                if (callback) {
                    result.push(record);
                }
            }
        });
        transformer.on('error', function (err) {
            error = true;
            if (callback)
                callback(err);
        });
        transformer.on('end', function () {
            if (callback && !error)
                callback(null, result);
        });
    }
    return transformer;
};
exports.transform = transform;
