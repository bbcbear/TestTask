
/*!
 * Module dependencies.
 */

var Readable = require('stream').Readable;
var inherits = require("util").inherits;

/**
 * Pull constructor.
 *
 * @param {Object} options
 */

function Pull(queue, redisClient, onTimeout, timeout) {
  var self = this;

  Readable.call(self, { objectMode: true });

  self.queue = queue;
  self.redis = redisClient;
  self.onTimeout = onTimeout || function () {};
  self.timeout = timeout || 10;
  self.idle = (self.timeout + (5 + Math.random() * (25 - 5) | 0)) * 1000;

  self.redis.on("error", function (err) {
    self.emit("error", err)
  });
}

/**
 * Implementation _read.
 */

Pull.prototype._read = function () {
  var self = this;

  self.idleTimeout && clearTimeout(self.idleTimeout);
  self.idleTimeout = setTimeout(self.onTimeout, self.idle);

  process.nextTick(function next() {
    self.redis.blpop(self.queue, self.timeout, function (err, res) {
      if (err) return self.emit("error", err);
      if (!res) return setImmediate(next);

      var queue = res[0];
      var data = res[1];

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

Pull.prototype.end = function () {
  this.redis.end(false);
  this.push(null);
};

/*!
 * Inherits from Readable.
 */

inherits(Pull, Readable)

/*!
 * Expose Pull.
 */

module.exports = exports = Pull;

