const { version } = require('../package.json');
const dbApi = require('./db-api');

const withPrefix = route => `/api${route}`;

/**
 * This method validates addresses request body
 * @param {Array[String]} addresses
 */
function validateAddressesReq({ addresses }) {
  if (!addresses || addresses.length > 20 || addresses.length === 0) {
    throw new Error('Addresses request length should be (0, 20]');
  }
  // TODO: Add address validation
  return true;
}

/**
 * Endpoint to handle getting UTXOs for given addresses
 * @param {Db Object} db
 * @param {*} logger
 */
const utxoForAddresses = (db, logger) => async (req, res, next) => {
  try {
    logger.debug('[utxoForAddresses] request start');
    validateAddressesReq(req.body);
    const result = await dbApi.utxoForAddresses(db, req.body);
    res.send(result);
    logger.debug('[utxoForAddresses] request end');
    return next();
  } catch (err) {
    logger.error('[utxoForAddresses] Error', err);
    return next(err);
  }
};

const transactionsHistory = (db, logger) => async (req, res, next) => {
  try {
    logger.debug('[transactionsHistory] request start');
    validateAddressesReq(req.body);
    const result = await dbApi.transactionsHistoryForAddresses(db, req.body);
    res.send(result);
    logger.debug('[transactionsHistory] request end');
    return next();
  } catch (err) {
    logger.error('[transactionsHistory] Error', err);
    return next(err);
  }
};

const signedTransaction = (db, logger) => async (req, res, next) => {
  try {
    logger.debug('[signedTransaction] request start');
    // TODO: Validate and broadcast
    res.send(true);
    logger.debug('[signedTransaction] request end');
    return next();
  } catch (err) {
    logger.error('[signedTransaction] Error', err);
    return next(err);
  }
};

/**
 * This endpoint returns the current deployed version. The goal of this endpoint is to
 * be used by monitoring tools to check service availability.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const healthCheck = () => (req, res, next) => {
  res.send({ version });
  return next();
};

module.exports = {
  healthCheck: {
    method: 'get',
    path: withPrefix('/healthcheck'),
    handler: healthCheck,
  },
  utxoForAddresses: {
    method: 'post',
    path: withPrefix('/txs/utxoForAddresses'),
    handler: utxoForAddresses,
  },
  transactionsHistory: {
    method: 'post',
    path: withPrefix('/txs/history'),
    handler: transactionsHistory,
  },
  signedTransaction: {
    method: 'post',
    path: withPrefix('/txs/signed'),
    handler: signedTransaction,
  },
};
