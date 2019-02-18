const { raw } = require('config/raw')
const { consoleLogger } = require('../src/logger')

module.exports = {
  appName: 'icarus-poc-backend-service',
  server: {
    corsEnabledFor: ['https://adalite.io', 'https://*.adalite.io', 'http://*.adalite.io',
     'https://adalite-staging.herokuapp.com', 'http://localhost:*'],
    allowCredentials: true,
    logger: raw(consoleLogger('error')),
    port: 8080,
    apiConfig: {
      addressesRequestLimit: 50,
      txHistoryResponseLimit: 20,
    },
    importerSendTxEndpoint: 'http://icarus-importer:8200/api/txs/signed',
  },
}
