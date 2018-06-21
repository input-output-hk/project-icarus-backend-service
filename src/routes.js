// @flow

import type { Logger } from 'bunyan';
import type {
  ServerConfig,
  Request,
  TxHistoryRequest,
  SignedTxRequest,
  DbApi,
} from 'icarus-backend'; // eslint-disable-line

const axios = require('axios');
const moment = require('moment');
const { version } = require('../package.json');
const errs = require('restify-errors');

const withPrefix = route => `/api${route}`;

/**
 * This method validates addresses request body
 * @param {Array[String]} addresses
 */
function validateAddressesReq(addressRequestLimit: number, { addresses } = {}) {
  if (!addresses || addresses.length > addressRequestLimit || addresses.length === 0) {
    throw new Error(`Addresses request length should be (0, ${addressRequestLimit}]`);
  }
  // TODO: Add address validation
  return true;
}

/**
 * This method validates dateFrom sent as request body is valid datetime
 * @param {String} dateFrom DateTime as String
 */
function validateDatetimeReq({ dateFrom } = {}) {
  if (!dateFrom || !moment(dateFrom).isValid()) {
    throw new Error('DateFrom should be a valid datetime');
  }
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
const utxoForAddresses = (dbApi: DbApi, { logger, apiConfig }: ServerConfig) => async (
  req: Request,
) => {
  validateAddressesReq(apiConfig.addressesRequestLimit, req.body);
  logger.debug('[utxoForAddresses] request is valid');
  const result = await dbApi.utxoForAddresses(req.body.addresses);
  logger.debug('[utxoForAddresses] result calculated');
  return result.rows;
};

/**
 * This endpoint filters the given addresses returning the ones that were
 * used at least once
 * @param {*} db Database
 * @param {*} Server Server Config Object
 */
const filterUsedAddresses = (dbApi: DbApi, { logger, apiConfig }: ServerConfig) => async (
  req: Request,
) => {
  validateAddressesReq(apiConfig.addressesRequestLimit, req.body);
  logger.debug('[filterUsedAddresses] request is valid');
  const result = await dbApi.filterUsedAddresses(req.body.addresses);
  logger.debug('[filterUsedAddresses] result calculated');
  return result.rows.reduce((acc, row) => acc.concat(row), []);
};

/**
 * Endpoint to handle getting Tx History for given addresses and Date Filter
 * @param {*} db Database
 * @param {*} Server Server Config Object
 */
const utxoSumForAddresses = (dbApi: DbApi, { logger, apiConfig }: ServerConfig) => async (
  req: Request,
) => {
  validateAddressesReq(apiConfig.addressesRequestLimit, req.body);
  logger.debug('[utxoSumForAddresses] request is valid');
  const result = await dbApi.utxoSumForAddresses(req.body.addresses);
  logger.debug('[utxoSumForAddresses] result calculated');
  return result.rows[0];
};

/**
 *
 * @param {*} db Database
 * @param {*} Server Config Object
 */
const transactionsHistory = (dbApi: DbApi, { logger, apiConfig }: ServerConfig) => async (
  req: TxHistoryRequest,
) => {
  validateAddressesReq(apiConfig.addressesRequestLimit, req.body);
  validateDatetimeReq(req.body);
  logger.debug('[transactionsHistory] request is valid');
  const result = await dbApi.transactionsHistoryForAddresses(
    apiConfig.txHistoryResponseLimit,
    req.body.addresses,
    moment(req.body.dateFrom).toDate(),
    req.body.txHash,
  );
  logger.debug('[transactionsHistory] result calculated');
  return result.rows;
};

/**
 *
 * @param {*} db Database
 * @param {*} Server Config Object
 */
const pendingTransactions = (dbApi: DbApi, { logger, apiConfig }: ServerConfig) => async (
  req: Request,
) => {
  validateAddressesReq(apiConfig.addressesRequestLimit, req.body);
  logger.debug('[pendingTransactions] request is valid');
  const result = await dbApi.pendingTransactionsForAddresses(
    req.body.addresses,
  );
  logger.debug('[pendingTransactions] result calculated');
  return result.rows;
};

/**
 * Broadcasts a signed transaction to the block-importer node
 * @param {*} db Database
 * @param {*} Server Server Config object
 */
const signedTransaction = (
  dbApi: DbApi,
  {
    logger,
    importerSendTxEndpoint,
  }: { logger: Logger, importerSendTxEndpoint: string },
) => async (req: SignedTxRequest) => {
  try {
    validateSignedTransactionReq(req.body);
    logger.debug('[signedTransaction] request start');
    const response = await axios.post(importerSendTxEndpoint, req.body);
    logger.debug('[signedTransaction] transaction sent to backend, response:', response);
    if (response.status === 200) {
      const parsedBody = response.data;
      if (parsedBody.Right) {
        // "Right" means 200 ok (success) -> also handle if Right: false (boolean response)
        return parsedBody.Right;
      } else if (parsedBody.Left) {
        // "Left" means error case -> return error with contents (exception on nextUpdate)
        logger.debug('[signedTransaction] Error trying to send transaction');
        throw new errs.InvalidContentError(
          'Error trying to send transaction',
          parsedBody.Left.contents,
        );
      }
      logger.debug('[signedTransaction] Unknown response from backend');
      throw new Error('Unknown response from backend.');
    }
    logger.error(
      '[signedTransaction] Error while doing request to backend',
      response,
    );
    throw new Error(`Error trying to send transaction ${response.data}`);
  } catch (err) {
    logger.error('[signedTransaction] Error', err);
    throw new Error('Error trying to send transaction');
  }
};

/**
 * This endpoint returns the current deployed version. The goal of this endpoint is to
 * be used by monitoring tools to check service availability.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const healthCheck = () => () => Promise.resolve({ version });

module.exports = {
  healthCheck: {
    method: 'get',
    path: withPrefix('/healthcheck'),
    handler: healthCheck,
  },
  filterUsedAddresses: {
    method: 'post',
    path: withPrefix('/addresses/filterUsed'),
    handler: filterUsedAddresses,
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
  pendingTransactions: {
    method: 'post',
    path: withPrefix('/txs/pending'),
    handler: pendingTransactions,
  },
  signedTransaction: {
    method: 'post',
    path: withPrefix('/txs/signed'),
    handler: signedTransaction,
  },
};
