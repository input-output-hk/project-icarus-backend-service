// @flow

const Logger = require('bunyan');
const defer = require('config/defer').deferConfig;

// eslint-disable-next-line new-cap
const consoleLogger = new Logger.createLogger({
  name: defer(() => this.appName),
  level: 'debug'
});

module.exports = {
  consoleLogger
};