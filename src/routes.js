const axios = require('axios');
const { version } = require('../package.json');
const dbApi = require('./db-api');
const errs = require('restify-errors');

const withPrefix = route => `/api${route}`;

/**
 * This method validates addresses request body
 * @param {Array[String]} addresses
 */
function validateAddressesReq({ addresses } = {}) {
  if (!addresses || addresses.length > 20 || addresses.length === 0) {
    throw new Error('Addresses request length should be (0, 20]');
  }
  // TODO: Add address validation
  return true;
}

/**
 * This method validates signedTransaction endpoint body in order to check
 * if signedTransaction is received ok and is valid
 * @param {Object} Signed Transaction Payload
 */
function validateSignedTransactionReq({ signedTx } = {}) {
  if (!signedTx) {
    throw new Error('Signed transaction missing');
  }
  // TODO: Add Transaction signature validation or other validations
  return true;
}

/**
 * Endpoint to handle getting UTXOs for given addresses
 * @param {*} db Database
 * @param {*} Server Server Config object
 */
const utxoForAddresses = (db, { logger }) => async (req, res, next) => {
  try {
    logger.debug('[utxoForAddresses] request start');
    validateAddressesReq(req.body);
    const result = await dbApi.utxoForAddresses(db, req.body.addresses);
    res.send(result.rows);
    logger.debug('[utxoForAddresses] request end');
    return next();
  } catch (err) {
    logger.error('[utxoForAddresses] Error', err);
    return next(err);
  }
};

/**
 * Endpoint to handle getting UTXOs amount sum for given addresses
 * @param {*} db Database
 * @param {*} Server Server Config object
 */
const utxoSumForAddresses = (db, { logger }) => async (req, res, next) => {
  try {
    logger.debug('[utxoSumForAddresses] request start');
    validateAddressesReq(req.body);
    const result = await dbApi.utxoSumForAddresses(db, req.body.addresses);
    res.send(result.rows[0]);
    logger.debug('[utxoSumForAddresses] request end');
    return next();
  } catch (err) {
    logger.error('[utxoSumForAddresses] Error', err);
    return next(err);
  }
};

const transactionsHistory = (db, { logger }) => async (req, res, next) => {
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

/**
 * Broadcasts a signed transaction to the block-importer node
 * @param {*} db Database
 * @param {*} Server Server Config object
 */
const signedTransaction = (db, { logger, importerSendTxEndpoint }) => async (
  req,
  res,
  next,
) => {
  try {
    logger.debug('[signedTransaction] request start');
    validateSignedTransactionReq(req.body);
    const response = await axios.post(importerSendTxEndpoint, req.body);
    if (response.status === 200) {
      const parsedBody = response.data;
      if (parsedBody.Right) {
        // "Right" means 200 ok (success) -> also handle if Right: false (boolean response)
        res.send(parsedBody.Right);
        logger.debug('[signedTransaction] request end');
        return next();
      } else if (parsedBody.Left) {
        // "Left" means error case -> return error with contents (exception on nextUpdate)
        logger.debug('[signedTransaction] Error trying to send transaction');
        return next(new errs.InvalidContentError('Error trying to send transaction', parsedBody.Left.contents));
      }
      logger.debug('[signedTransaction] Unknown response from backend');
      return next(new Error('Unknown response from backend.'));
    }
    logger.error('[signedTransaction] Error while doing request to backend', response);
    return next(new Error('Error trying to send transaction', response.data));
  } catch (err) {
    logger.error('[signedTransaction] Error', err);
    return next(new Error('Error trying to send transaction'));
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
  utxoSumForAddresses: {
    method: 'post',
    path: withPrefix('/txs/utxoSumForAddresses'),
    handler: utxoSumForAddresses,
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
