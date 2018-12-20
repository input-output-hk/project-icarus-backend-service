/* eslint-disable import/no-commonjs */
// ES6 import/export syntax was causing issues when parsing configs
// @flow
const Logger = require('bunyan')
const defer = require('config/defer').deferConfig

// $FlowFixMe if setting types here, `conf` libray fails when parsing
const consoleLogger = (level = 'debug') =>
  // eslint-disable-next-line new-cap
  new Logger.createLogger({
    // $FlowFixMe `this` global object comes from defer
    name: defer(() => this.appName),
    level,
  })

module.exports = {
  consoleLogger,
}
