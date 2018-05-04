const { raw } = require('config/raw');
const { consoleLogger } = require('../src/logger');

module.exports = {
  server: {
    corsEnabledFor: ['*'],
    logger: raw(consoleLogger),
  },
  db: {
    user: 'fake',
    host: 'fake',
    database: 'fake',
    password: 'fake',
    port: '5432',
    min: 4,
    max: 20,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 1000,
  },
};
