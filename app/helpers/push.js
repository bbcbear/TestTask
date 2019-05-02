/*!
 * Module dependencies.
 */

const Writable = require('stream').Writable;
const inherits = require("util").inherits;

/**
 * Push constructor
 *
 * @param {Object} options
 */

function Push(queue, redisClient) { //можно переписать по es6
  const self = this;

  Writable.call(self, { "objectMode": true });

  self.queue = queue; // магия с очередью
  self.redis = redisClient; // Обращение к редис

  self.redis.on("error", function (err) { //обработка ошибок потока записи
    self.end("error", err) //пишет в конец потока ошибку
  });

}

Push.prototype._write = function (data, e, next) {
  const self = this;

  self.redis.rpush(this.queue, JSON.stringify(data), function (err) {
    if (err) return next(err);
    self.emit('pushed', data);
    next();
  });
};

Push.prototype.end = function () { // предопределение поведение конца потока
  Push.super_.prototype.end.call(this);
  this.redis.end(false);
};

/*!
 * Inherits from Writable.
 */

inherits(Push, Writable); //наследуем в пуш врайтбл

/*!
 * Expose Push.
 */

module.exports = Push; //какой то наркоманский экспорт вырезал "module.exports = exports = Push;"
