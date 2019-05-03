const { Readable } = require('stream');
const { inherits } = require("util");

class Pull {
  constructor(queue, redisClient, onTimeout, timeout){
    /*
     * Create  readable stream  outputs { Objects }
     */
    Readable.call(this, { objectMode: true }); 

    this.queue = queue;
    this.redis = redisClient;
    this.onTimeout = onTimeout || 500;
    this.timeout = timeout || 500;
    this.idle = this.timeout || 1000;
  }
  /**
   * Subscribe to errors
   */
  get(){
    this.redis.on("error", (error) => {
      this.emit("error", error)
    });
  }
  _read(){
    const self = this;

    this.idleTimeout && clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(this.onTimeout, this.idle);

    process.nextTick(function next() {
      self.redis.blpop(self.queue, self.timeout, (error, response) => {
        let queue = response[0];
        let data = response[1];

        if (error) return self.emit("error", error);

        if (!response) return setImmediate(next);

        if (queue !== self.queue) return pull.emit("error", `Haven't subscribed to ${resQueue}`);

        if (!data) return setImmediate(next);

        try {
          data = JSON.parse(data)
        } catch(err) {
          return self.emit("error", err);
        }

        self.push(data);
      });
    });
  }
  end() {
    this.redis.end(false);
    this.push(null);
  }
}

inherits(Pull, Readable)

module.exports =  Pull;

