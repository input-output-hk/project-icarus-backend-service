// @flow

import type { Logger } from 'bunyan';
import type {
  LoggerObject,
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
function validateAddressesReq({ addresses } = {}) {
  if (!addresses || addresses.length > 100 || addresses.length === 0) {
    throw new Error('Addresses request length should be (0, 20]');
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
const utxoForAddresses = (dbApi: DbApi, { logger }: LoggerObject) => async (
  req: Request,
) => {
  validateAddressesReq(req.body);
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
const filterUsedAddresses = (dbApi: DbApi, { logger }: LoggerObject) => async (
  req: Request,
) => {
  validateAddressesReq(req.body);
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
const utxoSumForAddresses = (dbApi: DbApi, { logger, context }: LoggerObject) => async (
  req: Request,
) => {
  const mark = context.iopipe.mark;
  mark.start('validation-utxoSum');
  validateAddressesReq(req.body);
  mark.end('validation-utxoSum');
  logger.debug('[utxoSumForAddresses] request is valid');
  mark.start('database-utxoSum');
  const result = await dbApi.utxoSumForAddresses(req.body.addresses);
  mark.end('database-utxoSum');
  logger.debug('[utxoSumForAddresses] result calculated');
  return result.rows[0];
};

/**
 *
 * @param {*} db Database
 * @param {*} Server Config Object
 */
const transactionsHistory = (dbApi: DbApi, { logger, context }: LoggerObject) => async (
  req: TxHistoryRequest,
) => {
  const mark = context.iopipe.mark;
  mark.start('validation-transactonsHistory');
  validateAddressesReq(req.body);
  validateDatetimeReq(req.body);
  mark.end('validation-transactonsHistory');
  logger.debug('[transactionsHistory] request is valid');
  mark.start('database-transactonsHistory');
  const result = await dbApi.transactionsHistoryForAddresses(
    req.body.addresses,
    moment(req.body.dateFrom).toDate(),
    req.body.txHash,
  );
  mark.end('database-transactonsHistory');
  logger.debug('[transactionsHistory] result calculated');
  return result.rows;
};

/**
 *
 * @param {*} db Database
 * @param {*} Server Config Object
 */
const pendingTransactions = (dbApi: DbApi, { logger }: LoggerObject) => async (
  req: Request,
) => {
  validateAddressesReq(req.body);
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
    logger.debug(
      '[signedTransaction] transaction sent to backend, response:',
      response,
    );
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

const utxoSumForAddressesNULL = () => () =>
  Promise.resolve({ sum: '10000000' });

const transactionsHistoryNULL = () => () =>
  Promise.resolve([
    {
      hash: 'e1a958d42f7a064ef447feee5859fd45b8c925de825a7460819f67e8a4f320d0',
      inputs_address: [
        'DdzFFzCqrhsjRXHaGcwLdb82izDN3WNzJpyXnLQ2XPa7PKsuqVWbccKLHymdhgzys117xwosU7Kg8XrqHihHHJNNLDte6WrKq5zJ2Njk',
        'DdzFFzCqrhsjRXHaGcwLdb82izDN3WNzJpyXnLQ2XPa7PKsuqVWbccKLHymdhgzys117xwosU7Kg8XrqHihHHJNNLDte6WrKq5zJ2Njk',
      ],
      inputs_amount: ['10000000', '10000000'],
      outputs_address: [
        'DdzFFzCqrhsqFM8QxHC4ASk4QLfuoWqbY65GeprG8ezEY6VFkP4jz4C4fcDT57fkUUrPN8E2gaPXiWQxjD3BryptceQEx98ALsrYMoSi',
        'DdzFFzCqrhsxi87yX3WBKVJ37n7frUZjiVTwoc7qxdVeEAoqiRiLUecLngUhgYbc1hfTyzxtwvwSRtGNeWKJfaqMefs4dwybgHmwBj8c',
      ],
      outputs_amount: ['4821151', '15000000'],
      block_num: '116147',
      time: '2017-10-23T18:03:53.000Z',
      best_block_num: '1069366',
    },
    {
      hash: 'a8fb2c6cce6d68ea4c65b8301eb26636178c40d3c65071e738d5a4e5cde4d91d',
      inputs_address: [
        'DdzFFzCqrht9SryvcbmahwFFbXkDGzDtuA26Qccf1nQ9bWPmkej9i7q6e9A2bbEVEs2szYJtUupPAQLbh9fANEh1zBLikREmL3XubFAr',
      ],
      inputs_amount: ['96599520'],
      outputs_address: [
        'DdzFFzCqrhsgBCt25t6JArdDHfJZkzzebapE2qqrg1yoquLZzeEyxzhLAb9x7rVf5aby9jwLvL65hH9zTWjbekwzbeYCjJ5pUKn1rYgB',
        'DdzFFzCqrhszk2XG2vdMcB3JhkpGTTnMeWvwoE5wHacAu1H38bp5Smr6pxEvJDk5KzeKsTaPSmBVJ24hp2FfqxGDdgH7hp1H1bt5U8Hk',
        'DdzFFzCqrhszk2XG2vdMcB3JhkpGTTnMeWvwoE5wHacAu1H38bp5Smr6pxEvJDk5KzeKsTaPSmBVJ24hp2FfqxGDdgH7hp1H1bt5U8Hk',
        'DdzFFzCqrhszk2XG2vdMcB3JhkpGTTnMeWvwoE5wHacAu1H38bp5Smr6pxEvJDk5KzeKsTaPSmBVJ24hp2FfqxGDdgH7hp1H1bt5U8Hk',
      ],
      outputs_amount: ['96421943', '1', '1', '1'],
      block_num: '872076',
      time: '2018-04-17T04:24:13.000Z',
      best_block_num: '1069366',
    },
    {
      hash: 'de5dbbed46ef5c69f52b3a77ee74585bef07aebcd90383de28348159c697b568',
      inputs_address: [
        'DdzFFzCqrhsgBCt25t6JArdDHfJZkzzebapE2qqrg1yoquLZzeEyxzhLAb9x7rVf5aby9jwLvL65hH9zTWjbekwzbeYCjJ5pUKn1rYgB',
      ],
      inputs_amount: ['96421943'],
      outputs_address: [
        'DdzFFzCqrhsrDmGpSbh2LBRmStmMyGznXaeBLoDMSKjLfRuf9DWpLMEzbXw9eQcFsSwNX5sunRuxsJnSZFbu8pTe1qLerrWwwiinEzVe',
        'DdzFFzCqrhstXeWBtWKg1Z189XE5uwwwfbKeUHdacmnD1qMaNqs6Qk3ctZF1frH1wT5PnnJXzLC2fumc9qVWLFp9aMGPEfVzzL6eyKjM',
        'DdzFFzCqrhstXeWBtWKg1Z189XE5uwwwfbKeUHdacmnD1qMaNqs6Qk3ctZF1frH1wT5PnnJXzLC2fumc9qVWLFp9aMGPEfVzzL6eyKjM',
        'DdzFFzCqrhstXeWBtWKg1Z189XE5uwwwfbKeUHdacmnD1qMaNqs6Qk3ctZF1frH1wT5PnnJXzLC2fumc9qVWLFp9aMGPEfVzzL6eyKjM',
      ],
      outputs_amount: ['96244366', '1', '1', '1'],
      block_num: '872089',
      time: '2018-04-17T04:28:33.000Z',
      best_block_num: '1069366',
    },
  ]);

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
  nullOp: {
    method: 'post',
    path: withPrefix('/txs/utxoSumForAddressesNULL'),
    handler: utxoSumForAddressesNULL,
  },
  historyNullOp: {
    method: 'post',
    path: withPrefix('/txs/historyNULL'),
    handler: transactionsHistoryNULL,
  },
};
