// @flow

const Logger = require('bunyan');
const defer = require('config/defer').deferConfig;
const { DEBUG } = require('bunyan');
const defaultConfigs = require('../config/default.js');

// eslint-disable-next-line new-cap
const consoleLogger = new Logger.createLogger({
  name: defer(() => defaultConfigs.appName),
  level: DEBUG
});

module.exports = {
  consoleLogger
};