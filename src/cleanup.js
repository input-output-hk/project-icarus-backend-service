// @flow

import type { Pool } from 'pg';
import type { Logger } from 'bunyan';

const exitHandler = (db: Pool, logger: Logger) => options => () => {
  if (!db.ending) {
    logger.info('Cleaning the APP');
    db.end().then(() => {
      logger.info('DB Pool released!');
      if (options.exit) process.exit();
    }).catch(err => logger.error(err));
  } else if (options.exit) process.exit();
};

function config(db: Pool, logger: Logger) {
  const onExit = options => exitHandler(db, logger)(options);

  // do something when app is closing
  process.on('exit', onExit({ caller: 'exit' }));

  // catches ctrl+c event
  process.on('SIGINT', onExit({ caller: 'SIGINT', exit: true }));

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', onExit({ exit: true }));
  process.on('SIGUSR2', onExit({ caller: 'SIGUSR2', exit: true }));
}

module.exports = config;
