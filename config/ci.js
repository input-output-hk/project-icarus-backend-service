const { raw } = require('config/raw')
const { consoleLogger } = require('../src/logger')

module.exports = {
  server: {
    corsEnabledFor: ['*'],
    logger: raw(consoleLogger('fatal')),
    importerSendTxEndpoint: 'https://localhost:8200/api/txs/signed',
  },
  db: {
    user: 'root',
    host: 'localhost',
    database: 'icaruspocbackendservice-test',
    password: '',
    port: 5432,
    min: 4,
    max: 20,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 1000,
  },
}
