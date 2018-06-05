// @flow
import type {
  LoggerObject,
  DbApi,
} from 'icarus-backend'; // eslint-disable-line

const Lazy = require('lazy.js');

const fromMessage: any = JSON.parse;
const toMessage = JSON.stringify;

// TODO: Move to config
const MSG_TYPE_RESTORE = 'RESTORE';
const ADDRESSES_CHUNK_SIZE = 250000;

module.exports = (dbApi: DbApi, { logger }: LoggerObject) => (ws: any) => {
  ws.on('message', (msg) => {
    logger.debug('[WS::onMessage] %s', msg);
    const data = fromMessage(msg);
    switch (data.msg) {
      case MSG_TYPE_RESTORE:
        dbApi.unspentAddresses().then(result => {
          logger.debug(`[WS::onMessage] ${MSG_TYPE_RESTORE} - db result ready`);
          const addresses = Lazy(result.rows);
          logger.debug(`[WS::onMessage] ${MSG_TYPE_RESTORE} - addresses processing start`);
          addresses
            .flatten()
            .chunk(ADDRESSES_CHUNK_SIZE)
            .each((chunk, index) => {
              logger.debug(`[WS::onMessage] ${MSG_TYPE_RESTORE} - addresses processing step ${index}`);
              ws.send(toMessage({
                msg: 'RESTORE',
                step: index,
                addresses: chunk,
              }));
            });
        });
        break;
      default:
        break;
    }
  });
};
