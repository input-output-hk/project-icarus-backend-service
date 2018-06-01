// @flow
const Logger = require('bunyan');
const defer = require('config/defer').deferConfig;

const consoleLogger = (level: string = 'debug') =>
  // eslint-disable-next-line new-cap
  new Logger.createLogger({
    name: defer(() => this.appName),
    level,
  });

module.exports = {
  consoleLogger,
};
