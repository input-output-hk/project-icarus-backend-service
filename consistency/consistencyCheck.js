import type { Pool } from 'pg'; // eslint-disable-line
import type { DbApi } from 'icarus-backend'; // eslint-disable-line

const config = require('config');
const createDB = require('./db');
const configCleanup = require('./cleanup');
const constApi = require('./db-api');
const constProp = require('./properties');

const serverConfig = config.get('server');
const { logger } = serverConfig;

createDB(config.get('db')).then((db) => {
  logger.info('Connected to db');

  configCleanup(db, logger);

  const constApiWithDb = constApi(db);
  const properties = constProp(constApiWithDb);
  
//  properties.txAddrConsistentProp().then((test) => console.log(test));
  properties.txsConsistentProp().then((test) => console.log(test));
});
