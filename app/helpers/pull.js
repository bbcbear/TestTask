
/*!
 * Module dependencies.
 */

const { Readable } = require('stream');
const { inherits } = require("util");

/**
 * Pull constructor.
 *
 * @param {Object} options
 */

class Pull {
  constructor(queue, redisClient, onTimeout, timeout){

    Readable.call(this, { objectMode: true });

    this.queue = queue;
    this.redis = redisClient;
    this.onTimeout = onTimeout || function () {};
    this.timeout = timeout || 10;
    this.idle = (this.timeout + (5 + Math.random() * (25 - 5) | 0)) * 1000;
  }

  get(){
    this.redis.on("error", (err) => {
      this.emit("error", err)
    });
  }
  _read(){
    const self = this;

    this.idleTimeout && clearTimeout(self.idleTimeout);
    this.idleTimeout = setTimeout(self.onTimeout, self.idle);

    process.nextTick(function next() {
      self.redis.blpop(self.queue, self.timeout, function (err, res) {
        if (err) return self.emit("error", err);
        if (!res) return setImmediate(next);

        let queue = res[0];
        let data = res[1];

        if (queue !== self.queue)
          return pull.emit("error", "I haven't subscribed to the " + resQueue);

        if (!data)
          return setImmediate(next);

        try {
          data = JSON.parse(data)
        } catch(e) {
          return self.emit("error", e);
        }

        self.push(data);
      });
    });
  }
  end() {
    this.redis.end(false);
    this.push(null);
  }
}

/*!
 * Inherits from Readable.
 */

inherits(Pull, Readable)

/*!
 * Expose Pull.
 */

module.exports = exports = Pull;

