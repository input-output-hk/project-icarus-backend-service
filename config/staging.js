const { raw } = require('config/raw');
const { consoleLogger } = require('../src/logger');

module.exports = {
  server: {
    port: 8080,
    corsEnabledFor: ['*'],
    logger: raw(consoleLogger('fatal')),
    importerSendTxEndpoint: 'http://ec2-18-206-30-1.compute-1.amazonaws.com:8200/api/txs/signed',
  },
  db: {
    user: 'fake',
    host: 'fake',
    database: 'fake',
    password: 'fake',
    port: '5432',
    min: 4,
    max: 50,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 5000,
  },
};
