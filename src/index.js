// @flow

const fs = require('fs');
const pathLib = require('path');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const restifyBunyanLogger = require('restify-bunyan-logger');
const config = require('config');
const routes = require('./routes');
const createDB = require('./db');
const configCleanup = require('./cleanup');

const serverConfig = config.get('server');
const { logger } = serverConfig;

// Don't check client certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function addHttps(defaultRestifyConfig) {
  const TLS_DIR = pathLib.join(
    serverConfig.https.tlsDir,
    process.env.NODE_ENV ? process.env.NODE_ENV : '',
  );
  const httpsConfig = {
    certificate: fs.readFileSync(`${TLS_DIR}/server.crt`),
    key: fs.readFileSync(`${TLS_DIR}/server.key`),
    ca: fs.readFileSync(`${TLS_DIR}/ca.pem`),
  };
  return Object.assign({}, defaultRestifyConfig, httpsConfig);
}

createDB(config.get('db'))
  .then(db => {
    logger.info('Connected to db');

    const defaultRestifyConfig = {
      log: logger,
    };

    const restifyConfig = serverConfig.https
      ? addHttps(defaultRestifyConfig)
      : defaultRestifyConfig;

    const server = restify.createServer(restifyConfig);

    const cors = corsMiddleware({ origins: serverConfig.corsEnabledFor });
    server.pre(cors.preflight);
    server.use(cors.actual);
    server.use(restify.plugins.bodyParser());
    server.on('after', restifyBunyanLogger());

    // Load routes defined in the server
    Object.values(routes).forEach(({ method, path, handler }: any) => {
      server[method](path, handler(db, serverConfig));
    });

    configCleanup(db, logger);

    server.listen(serverConfig.port, () => {
      logger.info('%s listening at %s', server.name, server.url);
    });
  })
  .catch(err => logger.error(err));
