const LogLevel = {
  ERROR: 1,
  INFO: 2,
  DEBUG: 3,
};

const logger = {
  logLevel: LogLevel.DEBUG, // change this to enable more logging output

  error: function (...args) {
    if (this.logLevel >= LogLevel.ERROR) {
      console.log(...args);
    }
  },

  info: function (...args) {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(...args);
    }
  },

  debug: function (...args) {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(...args);
    }
  },
};

module.exports = logger;
