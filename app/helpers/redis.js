const redis = require('redis');

/*!
 * Expose create client.
 */
function redisClient (URI) {
  let options = parseRedisURI(URI || process.env.REDIS_URL);
  let client = redis.createClient(options.port, options.host);

  if (options.pass && options.pass.length) client.auth(options.pass);

  return client;
};

/**
 * Redis URI parser.
 *
 * @param {String} URI
 * @return Object
 */

const parseRedisURI = function (URI) {
  let options = {};
  let uri = require('url').parse(URI || 'redis://localhost:6379/2');

  if (uri.protocol === 'redis:') {
    if (uri.auth) {
      let passparts = uri.auth.split(":");
      options.pass = passparts[0];
    }

    options.host = uri.hostname || 'localhost';
    options.port = uri.port || 6379;
    options.cache = true;

    uri.pathname ? options.db = uri.pathname.replace("/", "", 1) : options.db = 0;
  }
  return options;
}
module.exports.parseRedisURI;
module.exports = redisClient;
