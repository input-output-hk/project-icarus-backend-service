const fs = require('fs');
const path = require('path');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const restifyBunyanLogger = require('restify-bunyan-logger');
const config = require('config');
const routes = require('./routes');
const createDB = require('./db');
const configCleanup = require('./cleanup');

const serverConfig = config.get('server');
const logger = serverConfig.logger;

createDB(config.get('db'))
  .then(db => {
    const TLS_DIR = path.join(serverConfig.tlsDir, process.env.NODE_ENV);

    const server = restify.createServer({
      certificate: fs.readFileSync(`${TLS_DIR}/server.crt`),
      key: fs.readFileSync(`${TLS_DIR}/server.key`),
      ca: fs.readFileSync(`${TLS_DIR}/ca.crt`),
      log: logger,
    });

    const cors = corsMiddleware({ origins: serverConfig.corsEnabledFor });
    server.pre(cors.preflight);
    server.use(cors.actual);
    server.use(restify.plugins.bodyParser());
    server.on('after', restifyBunyanLogger());

    // Route config. We could use a better router here but we will only support
    // three routes (atm) so it's not worthy to use another package to do so.
    server.get('*', routes.sayHi(db, logger));

    configCleanup(db, logger);

    server.listen(serverConfig.httpsPort, () => {
      logger.info('%s listening at %s', server.name, server.url);
    });
  })
  .catch(err => logger.error(err));
