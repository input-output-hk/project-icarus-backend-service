const { raw } = require('config/raw');
const { consoleLogger } = require('../src/logger');

module.exports = {
  server: {
    corsEnabledFor: ['*'],
    logger: raw(consoleLogger),
    https: {
      tlsDir: './tls-files',
    },
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
