// @flow
import type {
  ServerConfig,
  DbApi,
} from 'icarus-backend'; // eslint-disable-line
const _ = require('lodash');

const fromMessage: any = JSON.parse;
const toMessage = JSON.stringify;

const MSG_TYPE_RESTORE = 'RESTORE';

async function handleRestore(
  dbApi: DbApi,
  { logger }: ServerConfig,
  ws: any,
) {
  try {
    logger.debug('[WS::handleRestore] Start');
    const result = await dbApi.unspentAddresses();
    logger.debug('[WS::handleRestore] Db result ready');
    logger.debug('[WS::handleRestore] Addresses processing start');
    const addresses = _.flatten(result.rows);
    logger.debug('[WS::handleRestore] About to send the addresses');
    ws.send(toMessage({
      msg: MSG_TYPE_RESTORE,
      addresses,
    }));
    logger.debug('[WS::handleRestore] End');
  } catch (err) {
    logger.error('[WS::handleRestore]', err);
  }
}

module.exports = (dbApi: DbApi, { logger, apiConfig }: ServerConfig) => (ws: any) => {
  ws.on('message', (msg) => {
    logger.debug(`[WS::onMessage] ${msg}`);
    const data = fromMessage(msg);
    switch (data.msg) {
      case MSG_TYPE_RESTORE:
        handleRestore(dbApi, { logger, apiConfig }, ws);
        break;
      default:
        break;
    }
  });
};
