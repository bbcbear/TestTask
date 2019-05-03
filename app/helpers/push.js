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

  this.queue = queue; // магия с очередью
  this.redis = redisClient; // Обращение к редис

  this.redis.on("error", function (err) { //обработка ошибок потока записи
    this.end("error", err) //пишет в конец потока ошибку
  });

}

_write(data, e, next) {
  const self = this;

  self.redis.rpush(this.queue, JSON.stringify(data), function (err) {
    if (err) return next(err);
    self.emit('pushed', data);
    next();
  });
};

end() { // предопределение поведение конца потока
  Push.super_.prototype.end.call(this);
  this.redis.end(false);
};
}