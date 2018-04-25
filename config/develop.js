const Logger = require('bunyan');
const defer = require('config/defer').deferConfig;
const { raw } = require('config/raw');

// eslint-disable-next-line new-cap
const logger = new Logger.createLogger({
  name: defer(() => this.appName),
  level: 'debug',
});

module.exports = {
  server: {
    corsEnabledFor: ['*'],
    logger: raw(logger),
  },
  db: {
    user: 'postgres',
    host: 'localhost',
    database: 'icaruspocbackendservice',
    password: 'mysecretpassword',
    port: 5432,
    min: 4,
    max: 20,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 1000,
  },
};
