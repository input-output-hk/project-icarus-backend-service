const { raw } = require('config/raw');
const { consoleLogger } = require('../src/logger');

var getEnv = function(name) {
    var ret = process.env[name];
    if (!ret)
        throw ("Environment variables should be defined: " + name);
    return ret;
}

module.exports = {
    server: {
        corsEnabledFor: ['*'],
        logger: raw(consoleLogger('info')),
        port: 8080,
        importerSendTxEndpoint: getEnv("IMPORTER_ENDPOINT"),
    },
    db: {
        user: getEnv("DB_USER"),
        host: getEnv("DB_HOST"),
        database: getEnv("DB"),
        password: getEnv("DB_PASSWORD"),
        port: '5432',
        min: 4,
        max: 50,
        idleTimeoutMillis: 1000,
        connectionTimeoutMillis: 5000,
    },
};
