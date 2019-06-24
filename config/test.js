const { raw } = require('config/raw')
const { consoleLogger } = require('../src/logger')

module.exports = {
  server: {
    corsEnabledFor: '*',
    logger: raw(consoleLogger('fatal')),
    importerSendTxEndpoint: 'https://localhost:8200/api/txs/signed',
    disableHealthcheck: true,
  },
  db: {
    user: 'postgres',
    host: 'localhost',
    database: 'icaruspocbackendservice-test',
    password: 'mysecretpassword',
    port: 5432,
    min: 4,
    max: 20,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 1000,
  },
}
