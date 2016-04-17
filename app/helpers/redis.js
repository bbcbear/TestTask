
/*!
 * Module dependencies.
 */

var redis = require('redis');
var _ = require('lodash');

/*!
 * Expose create client.
 */

module.exports = function (URI) {
  var options = parseRedisURI(URI || process.env.REDIS_URL);

  var client = redis.createClient(options.port, options.host);

  if (options.database)
    client.select(options.database);

  if (options.pass && options.pass.length)
    client.auth(options.pass);

  return client;
};

/**
 * Redis URI parser.
 *
 * @param {String} URI
 * @return Object
 */

var parseRedisURI = module.exports.parseRedisURI = function (URI) {
  var options = {};
  var uri = require('url').parse(URI || 'redis://localhost:6379/2');
  if (uri.protocol === 'redis:') {
    if (uri.auth) {
      var passparts = uri.auth.split(":");
      options.pass = passparts[0];
      if (passparts.length === 2)
        options.pass = passparts[1];
    }
    options.host = uri.hostname || 'localhost';
    options.port = uri.port || 6379;
    options.cache = true;
    if (uri.pathname)
      options.db = uri.pathname.replace("/", "", 1);
    else 
      options.db = 0;
  }
  return options;
}

