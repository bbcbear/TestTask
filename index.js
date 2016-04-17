
/*!
 * Module dependencies.
 */

var minimist = require('minimist');
var Pull = require('./app/helpers/pull');
var Push = require('./app/helpers/push');
var notifier = require('./app/helpers/notifier');
var redisClient = require('./app/helpers/redis');

/*!
 * Models.
 */

var Message = require('./app/models/Message');

/*!
 * Get errors.
 */

var argv = minimist(process.argv.slice(2));
if (~argv._.indexOf('getErrors'))
  return createGetErrors();

/*!
 * Start worker.
 */

var worker = createWorker();

/*!
 * Events.
 */

notifier.subscribe('idleTimeout', function () {
  worker.end();
  if (worker instanceof Push) return worker = createWorker();
  if (worker instanceof Pull) return worker = createGenerator();
});

/*!
 * Create worker.
 */

function createWorker() {
  var errors = new Push('errors', redisClient());
  var worker = new Pull('messages', redisClient(), function onTimeout() {
    notifier.publish('idleTimeout', true);
  });

  worker.on("data", function (data) {
    eventHandler(data, function (err, data) {
      if (err) return errors.write(data);
      console.log('Read message', data);
    })
  });

  return worker;
}

function eventHandler(msg, callback) {
  function onComplete() {
    var error = Math.random() > 0.85;
    callback(error, msg);
  }

  setTimeout(onComplete, Math.floor(Math.random() * 1000));
}

/*!
 * Create generator.
 */

function createGenerator() {
  var client = redisClient();
  var generator = new Push('messages', redisClient());

  (function next() {
    var message = Message.getMessage();
    generator.write(message);
    console.log('Write message', message);
    client.llen('messages', function (err, length) {
      if (length > 1000000)
        return notifier.publish('idleTimeout', true);
      next();
    });
  })();

  return generator;
}

/*!
 * Create get errors.
 */

function createGetErrors() {
  var errors = new Pull('errors', redisClient(), function () {
    errors.end();
  }, 0);

  errors.on("data", function (data) {
    console.log(data);
  });

  return errors;
}

