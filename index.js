const minimist = require('minimist');

const Pull = require('./app/helpers/pull');
const Push = require('./app/helpers/push');
const notifier = require('./app/helpers/notifier');
const redisClient = require('./app/helpers/redis');
const Message = require('./app/models/Message');

/*
 * Get errors.
 */

const argv = minimist(process.argv.slice(2));
if (argv._.includes('getErrors'))
  return createGetErrors();

/*!
 * Start worker.
 */

let worker = createWorker();

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
  let errors = new Push('errors', redisClient());
  let worker = new Pull('messages', redisClient(), function onTimeout() {
    notifier.publish('idleTimeout', true);
  });

  worker.on("data", function (data) {
    eventHandler(data, function (err, data) {
      if (err) {
        console.log('Error message', data);
        return errors.write(data);
      }
      console.log('Read message', data);
    })
  });

  return worker;
}

function eventHandler(msg, callback) {
  function onComplete() {
    let error = Math.random() > 0.85;
    callback(error, msg);
  }

  setTimeout(onComplete, Math.floor(Math.random() * 1000));
}
/*!
 * Create generator.
 */

function createGenerator() {
  let client = redisClient();
  let generator = new Push('messages', redisClient());

  (function next() {
    let message = Message.getMessage();
    generator.write(message);
    console.log('Write message', message);
    client.llen('messages', (err, length) => {
      if (length > 100000){
        return notifier.publish('idleTimeout', true);
      }  
      next();
    });
  })();
  return generator;
}

/*!
 * Create get errors.
 */

function createGetErrors() {
  let errors = new Pull('errors', redisClient(), () => errors.end(), 0);
  errors.on("data", (data) => console.log(data));
  return errors;
}
