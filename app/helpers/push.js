module.exports = class Push{

/**
 * Push constructor
 *
 * @param {Object} options
 */

  constructor(queue, redisClient) {
  /*!
  * Module dependencies.
  */
    const { Writable } = require('stream');
    const { inherits } = require('util');
  
  /*!
  * Inherits from Writable.
  */
    inherits(Push, Writable);

    Writable.call(this, { "objectMode": true });

    this.queue = queue;
    this.redis = redisClient;

    this.redis.on("error", (err) => {
      this.end("error", err)
     });
}

  _write(data, e, next) {

    this.redis.rpush(this.queue, JSON.stringify(data), (err) => {
      if (err) return next(err);
      this.emit('pushed', data);
      next();
    });
  };

  end() {
    Push.super_.prototype.end.call(this);
    this.redis.end(false);
  };
}