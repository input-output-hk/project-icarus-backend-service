const Logger = require('bunyan');
const defer = require('config/defer').deferConfig;

// eslint-disable-next-line new-cap
const consoleLogger = (level = 'debug') => new Logger.createLogger({
  name: defer(() => this.appName),
  level,
});

module.exports = {
  consoleLogger,
};
