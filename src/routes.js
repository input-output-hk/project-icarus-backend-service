// @flow

import type { Logger } from 'bunyan'
import type {
  ServerConfig,
  Request,
  TxHistoryRequest,
  SignedTxRequest,
  DbApi,
  ImporterApi,
} from 'icarus-backend'; // eslint-disable-line

import { InternalError, InvalidContentError, InternalServerError } from 'restify-errors'
import moment from 'moment'
import { version } from '../package.json'

const withPrefix = route => `/api/v2${route}`

/**
 * This method validates addresses request body
 * @param {Array[String]} addresses
 */
function validateAddressesReq(addressRequestLimit: number, { addresses } = {}) {
  if (!addresses || addresses.length > addressRequestLimit || addresses.length === 0) {
    throw new Error(`Addresses request length should be (0, ${addressRequestLimit}]`)
  }
  // TODO: Add address validation
  return true
}

/**
 * This method validates dateFrom sent as request body is valid datetime
 * @param {String} dateFrom DateTime as String
 */
function validateDatetimeReq({ dateFrom } = {}) {
  if (!dateFrom || !moment(dateFrom).isValid()) {
    throw new Error('DateFrom should be a valid datetime')
  }
  return true
}

/**
 * This method validates signedTransaction endpoint body in order to check
 * if signedTransaction is received ok and is valid
 * @param {Object} Signed Transaction Payload
 */
function validateSignedTransactionReq({ signedTx } = {}) {
  if (!signedTx) {
    throw new Error('Signed transaction missing')
  }
  // TODO: Add Transaction signature validation or other validations
  return true
}

/**
 * Endpoint to handle getting UTXOs for given addresses
 * @param {*} db Database
 * @param {*} Server Server Config object
 */
const utxoForAddresses = (dbApi: DbApi, { logger, apiConfig }: ServerConfig) => async (
  req: Request,
) => {
  validateAddressesReq(apiConfig.addressesRequestLimit, req.body)
  logger.debug('[utxoForAddresses] request is valid')
  const result = await dbApi.utxoForAddresses(req.body.addresses)
  logger.debug('[utxoForAddresses] result calculated')
  return result.rows
}

/**
 * This endpoint filters the given addresses returning the ones that were
 * used at least once
 * @param {*} db Database
 * @param {*} Server Server Config Object
 */
const filterUsedAddresses = (dbApi: DbApi, { logger, apiConfig }: ServerConfig) => async (
  req: Request,
) => {
  validateAddressesReq(apiConfig.addressesRequestLimit, req.body)
  logger.debug('[filterUsedAddresses] request is valid')
  const result = await dbApi.filterUsedAddresses(req.body.addresses)
  logger.debug('[filterUsedAddresses] result calculated')
  return result.rows.reduce((acc, row) => acc.concat(row), [])
}

/**
 * Endpoint to handle getting Tx History for given addresses and Date Filter
 * @param {*} db Database
 * @param {*} Server Server Config Object
 */
const utxoSumForAddresses = (dbApi: DbApi, { logger, apiConfig }: ServerConfig) => async (
  req: Request,
) => {
  validateAddressesReq(apiConfig.addressesRequestLimit, req.body)
  logger.debug('[utxoSumForAddresses] request is valid')
  const result = await dbApi.utxoSumForAddresses(req.body.addresses)
  logger.debug('[utxoSumForAddresses] result calculated')
  return result.rows[0]
}

/**
 *
 * @param {*} db Database
 * @param {*} Server Config Object
 */
const transactionsHistory = (dbApi: DbApi, { logger, apiConfig }: ServerConfig) => async (
  req: TxHistoryRequest,
) => {
  validateAddressesReq(apiConfig.addressesRequestLimit, req.body)
  validateDatetimeReq(req.body)
  logger.debug('[transactionsHistory] request is valid')
  const result = await dbApi.transactionsHistoryForAddresses(
    apiConfig.txHistoryResponseLimit,
    req.body.addresses,
    moment(req.body.dateFrom).toDate(),
  )
  logger.debug('[transactionsHistory] result calculated')
  return result.rows
}

/**
 * Broadcasts a signed transaction to the block-importer node
 * @param {*} db Database
 * @param {*} Server Server Config object
 */
const signedTransaction = (
  dbApi: DbApi,
  {
    logger,
  }: { logger: Logger },
  importerApi: ImporterApi,
) => async (req: SignedTxRequest) => {
  validateSignedTransactionReq(req.body)
  logger.debug('[signedTransaction] request start')
  let response
  try {
    response = await importerApi.sendTx(req.body)
  } catch (err) {
    logger.debug('[signedTransaction] Error trying to connect with importer')
    throw new InternalError('Error trying to connect with importer', err)
  }
  logger.debug('[signedTransaction] transaction sent to backend, response:', response)
  if (response.status === 200) {
    const parsedBody = response.data
    if (parsedBody.Right) {
      // "Right" means 200 ok (success) -> also handle if Right: false (boolean response)
      return parsedBody.Right
    } else if (parsedBody.Left) {
      // "Left" means error case
      if (parsedBody.Left.includes('witness doesn\'t match address') ||
        parsedBody.Left.includes('witness doesn\'t pass verification')) {
        logger.debug('[signedTransaction] Invalid witness')
        throw new InvalidContentError(
          'Invalid witness',
          parsedBody.Left,
        )
      }
      logger.debug('[signedTransaction] Error processing transaction')
      throw new InvalidContentError(
        'Error processing transaction',
        parsedBody.Left,
      )
    }
    logger.debug('[signedTransaction] Unknown response from backend')
    throw new InternalServerError('Unknown response from backend.', parsedBody)
  }
  logger.error(
    '[signedTransaction] Error while doing request to backend',
    response,
  )
  throw new Error(`Error trying to send transaction ${response.data}`)
}

/**
 * This endpoint returns the current deployed version. The goal of this endpoint is to
 * be used by monitoring tools to check service availability.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const healthCheck = () => () => Promise.resolve({ version })

export default {
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
  signedTransaction: {
    method: 'post',
    path: withPrefix('/txs/signed'),
    handler: signedTransaction,
  },
}
