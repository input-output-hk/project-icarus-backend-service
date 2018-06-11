// @flow
import type {
  LoggerObject,
  DbApi,
} from 'icarus-backend'; // eslint-disable-line

const Lazy = require('lazy.js');

const fromMessage: any = JSON.parse;
const toMessage = JSON.stringify;

const MSG_TYPE_RESTORE = 'RESTORE';
// FIXME: Manage the case of more than one step.
const ADDRESSES_CHUNK_SIZE = 1000000000;

function handleRestore(
  dbApi: DbApi,
  { logger }: LoggerObject,
  ws: any,
): void {
  dbApi.unspentAddresses().then(result => {
    logger.debug(`[WS::onMessage] ${MSG_TYPE_RESTORE} - Db result ready`);
    const addresses = Lazy(result.rows);
    logger.debug(`[WS::onMessage] ${MSG_TYPE_RESTORE} - Addresses processing start`);
    addresses
      .flatten()
      .chunk(ADDRESSES_CHUNK_SIZE)
      .each((chunk, index) => {
        logger.debug(`[WS::onMessage] ${MSG_TYPE_RESTORE} - Addresses processing step ${index}`);
        ws.send(toMessage({
          msg: MSG_TYPE_RESTORE,
          addresses: chunk,
        }));
      });
  });
}

module.exports = (dbApi: DbApi, { logger }: LoggerObject) => (ws: any) => {
  ws.on('message', (msg) => {
    logger.debug(`[WS::onMessage] ${msg}`);
    const data = fromMessage(msg);
    switch (data.msg) {
      case MSG_TYPE_RESTORE:
        handleRestore(dbApi, { logger }, ws);
        break;
      default:
        break;
    }
  });
};
