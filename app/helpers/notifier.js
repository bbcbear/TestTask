
/*!
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var inherits = require("util").inherits;

var Notifier = function() { EventEmitter.call(this); };

Notifier.prototype.subscribe = function(topic, cb){
  this.on(topic, cb);
};

Notifier.prototype.publish = function() {
  this.emit.apply(this, arguments);
};

inherits(Notifier, EventEmitter);

/*!
 * Expose singleton Notifier.
 */

module.exports = exports = new Notifier();

