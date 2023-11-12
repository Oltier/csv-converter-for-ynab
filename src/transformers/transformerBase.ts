/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2010 Adaltas https://github.com/adaltas/node-csv/blob/master/LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Transform } from 'stream';

type TransformerProps = {
  consume?: boolean;
  objectMode?: boolean;
  parallel?: number;
  params?: any;
};

type TransformerOptions = {
  consume: boolean;
  objectMode: boolean;
  parallel: number;
  params: Record<string, any> | null;
};

export type HandlerCallback<T = any> = (err?: null | Error, record?: T) => void;
type Handler<T = any, U = any> = (record: T, callback: HandlerCallback, params?: any) => U;

const defaultTransformerOptions: TransformerOptions = {
  consume: false,
  objectMode: true,
  parallel: 100,
  params: null
};

class Transformer<T = any, U = any> extends Transform {
  private options: TransformerOptions;
  private handler: Handler<T, U>;
  private state: {
    running: number;
    started: number;
    finished: number;
    paused: boolean;
  };

  constructor(baseOptions: TransformerProps = {}, handler: Handler) {
    const options = {
      ...defaultTransformerOptions,
      ...baseOptions
    };

    super(options);

    this.options = options;
    this.handler = handler;
    this.state = {
      running: 0,
      started: 0,
      finished: 0,
      paused: false
    };
  }

  _transform(chunk: any, _: any, cb: HandlerCallback): void {
    this.state.started++;
    this.state.running++;

    // Accept additional chunks to be processed in parallel
    if (!this.state.paused && this.state.running < this.options.parallel) {
      cb();
      cb = () => {}; // Cancel further callback execution
    }

    try {
      let l = this.handler.length;
      if (this.options.params !== null) {
        l--;
      }
      if (l === 1) {
        // sync
        const result = this.handler.call(this, chunk, cb, this.options.params);
        if (result instanceof Promise) {
          result.then((result) => {
            this.__done(null, [result], cb);
          });
          result.catch((err) => {
            this.__done(err, []);
          });
        } else {
          this.__done(null, [result], cb);
        }
      } else if (l === 2) {
        // async
        const callback = (err: any, ...chunks: any[]) => this.__done(err, chunks, cb);
        this.handler.call(this, chunk, callback, this.options.params);
      } else {
        throw Error('Invalid handler arguments');
      }
    } catch (err) {
      this.__done(err, []);
    }
  }

  _flush(cb: HandlerCallback): void {
    if (this.state.running === 0) {
      cb();
    } else {
      this._ending = () => {
        cb();
      };
    }
  }

  private _ending?: () => void;

  private __done(err: any, chunks: any[], cb?: HandlerCallback): any | undefined {
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

export default Transformer;
