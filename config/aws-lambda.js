const { raw } = require('config/raw');

module.exports = {
  server: {
    logger: raw(console),
    importerSendTxEndpoint: 'http://ec2-18-206-30-1.compute-1.amazonaws.com:8200/api/txs/signed',
  },
  db: {
    user: 'fake',
    host: 'fake',
    database: 'fake',
    password: 'fake',
    port: '5432',
    min: 0,
    max: 1,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 1000 * 10,
  },
};
