
/*!
 * Module dependencies.
 */

var Writable = require('stream').Writable;
var inherits = require("util").inherits;

/**
 * Push constructor
 *
 * @param {Object} options
 */

function Push(queue, redisClient) {
  var self = this;

  Writable.call(self, { "objectMode": true });

  self.queue = queue;
  self.redis = redisClient;

  self.redis.on("error", function (err) {
    self.end("error", err)
  });

}

Push.prototype._write = function (data, e, next) {
  var self = this;

  self.redis.rpush(this.queue, JSON.stringify(data), function (err) {
    if (err) return next(err);
    self.emit('pushed', data);
    next();
  });
};

Push.prototype.end = function () {
  Push.super_.prototype.end.call(this);
  this.redis.end(false);
};

/*!
 * Inherits from Writable.
 */

inherits(Push, Writable);

/*!
 * Expose Push.
 */

module.exports = exports = Push;
