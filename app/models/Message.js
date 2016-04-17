
/*!
 * Module dependencies.
 */

function Message() {
  this.cnt = 0;
}

/**
 * Generate message
 *
 * @return Number
 */

Message.prototype.getMessage = function () {
  return this.cnt++;
}

module.exports = new Message();
