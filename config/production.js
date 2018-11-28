const { raw } = require('config/raw');
const { consoleLogger } = require('../src/logger');

module.exports = {
  appName: 'icarus-poc-backend-service',
  server: {
    corsEnabledFor: ['*'],
    logger: raw(consoleLogger('error')),
    port: 8080,
    apiConfig: {
      addressesRequestLimit: 50,
      txHistoryResponseLimit: 20,
    },
    importerSendTxEndpoint: 'https://localhost:8200/api/txs/signed',
  },
};
