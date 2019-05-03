const { EventEmitter } = require('events');
const { inherits }     = require("util");

class Notifier {
  constructor(){
    EventEmitter.call(this);
  }
  subscribe (topic, callback) {
    this.on(topic, callback);
  }
  publish() {
    this.emit.apply(this, arguments);
  }
};

inherits(Notifier, EventEmitter);

module.exports = new Notifier();
