// @flow

import { isValidAddress } from 'cardano-crypto.js'
import moment from 'moment'
import Big from 'big.js'
import { zip, nth } from 'lodash'

import type { ServerConfig } from 'icarus-backend'; // eslint-disable-line

const withPrefix = route => `/api${route}`
const invalidAddress = 'Invalid Cardano address!'
const invalidTx = 'Invalid transaction id!'

const arraySum = (numbers) => numbers.reduce((acc, val) => acc.plus(Big(val)), Big(0))

const txAddressCoins = (addresses, amounts, address) => arraySum(zip(addresses, amounts)
  .filter((pair) => pair[0] === address)
  .map((pair) => nth(pair, 1)))

const txToAddressInfo = (row) => ({
  ctbId: row.hash,
  ctbTimeIssued: moment(row.time).unix(),
  ctbInputs: row.inputs_address.map(
    (addr, i) => [addr, { getCoin: row.inputs_amount[i] }]),
  ctbOutputs: row.outputs_address.map(
    (addr, i) => [addr, { getCoin: row.outputs_amount[i] }]),
  ctbInputSum: {
    getCoin: `${arraySum(row.inputs_amount)}`,
  },
  ctbOutputSum: {
    getCoin: `${arraySum(row.outputs_amount)}`,
  },
})

/**
 * This endpoint returns a summary for a given address
 * @param {*} db Database
 * @param {*} Server Server Config Object
 */
const addressSummary = (dbApi: any, { logger }: ServerConfig) => async (req: any,
) => {
  const { address } = req.params
  if (!isValidAddress(address)) {
    return { Left: invalidAddress }
  }
  const result = await dbApi.addressSummary(address)
  const transactions = result.rows
  const totalAddressIn = transactions.reduce((acc, tx) =>
    acc.plus(txAddressCoins(tx.outputs_address, tx.outputs_amount, address)), Big(0))
  const totalAddressOut = transactions.reduce((acc, tx) =>
    acc.plus(txAddressCoins(tx.inputs_address, tx.inputs_amount, address)), Big(0))

  const right = {
    caAddress: address,
    caType: 'CPubKeyAddress',
    caTxNum: transactions.length,
    caBalance: {
      getCoin: `${totalAddressIn.sub(totalAddressOut)}`,
    },
    caTxList: transactions.map(txToAddressInfo),
  }
  logger.debug('[addressSummary] result calculated')
  return { Right: right }
}

/**
 * This endpoint returns a transaction summary for a given hash
 * @param {*} db Database
 * @param {*} Server Server Config Object
 */
const txSummary = (dbApi: any, { logger }: ServerConfig) => async (req: any,
) => {
  const { tx } = req.params
  const result = await dbApi.txSummary(tx)
  if (result.rows.length === 0) {
    return { Left: invalidTx }
  }
  const row = result.rows[0]
  const totalInput = arraySum(row.inputs_amount)
  const totalOutput = arraySum(row.outputs_amount)
  const epoch0 = 1506203091
  const slotSeconds = 20
  const epochSlots = 21600
  const blockTime = moment(row.time).unix()
  const right = {
    ctsId: row.hash,
    ctsTxTimeIssued: blockTime,
    ctsBlockTimeIssued: blockTime,
    ctsBlockHeight: Number(row.block_num),
    ctsBlockEpoch: Math.floor((blockTime - epoch0) / (epochSlots * slotSeconds)),
    ctsBlockSlot: Math.floor((blockTime - epoch0) / slotSeconds) % epochSlots,
    ctsBlockHash: row.block_hash,
    ctsRelayedBy: null,
    ctsTotalInput: {
      getCoin: `${totalInput}`,
    },
    ctsTotalOutput: {
      getCoin: `${totalOutput}`,
    },
    ctsFees: {
      getCoin: `${totalInput.sub(totalOutput)}`,
    },
    ctsInputs: row.inputs_address.map(
      (addr, i) => [addr, { getCoin: row.inputs_amount[i] }]),
    ctsOutputs: row.outputs_address.map(
      (addr, i) => [addr, { getCoin: row.outputs_amount[i] }]),
  }
  logger.debug('[txSummary] result calculated')
  return { Right: right }
}

/**
 * This endpoint returns a raw transaction body for a given hash
 * @param {*} db Database
 * @param {*} Server Server Config Object
 */
const txRaw = (dbApi: any, { logger }: ServerConfig) => async (req: any,
) => {
  const { tx } = req.params
  const result = await dbApi.txSummary(tx)
  if (result.rows.length === 0) {
    return { Left: invalidTx }
  }
  logger.debug('[txRaw] result calculated')
  return { Right: result.rows[0].tx_body }
}

/**
 * This endpoint returns unspent transaction outputs for a given array of addresses
 * @param {*} db Database
 * @param {*} Server Server Config Object
 */
const unspentTxOutputs = (dbApi: any, { logger, apiConfig }: ServerConfig) => async (req: any,
) => {
  const addresses = req.body
  const limit = apiConfig.addressesRequestLimit
  if (!addresses || addresses.length === 0 || addresses.length > limit) {
    return { Left: `Addresses request length should be (0, ${limit}]` }
  }
  if (addresses.some((addr) => !isValidAddress(addr))) {
    return { Left: invalidAddress }
  }
  const result = await dbApi.utxoLegacy(addresses)
  const mappedRows = result.rows.map((row) => {
    const coins = row.cuCoins
    const newRow = row
    newRow.cuCoins = { getCoin: coins }
    return newRow
  })
  logger.debug('[unspentTxOutputs] result calculated')
  return { Right: mappedRows }
}

/**
 * This endpoint returns information about the last 20 transactions
 * @param {*} db Database
 * @param {*} Server Server Config Object
 */
const lastTxs = (dbApi: any, { logger }: ServerConfig) => async () => {
  const result = await dbApi.lastTxs()
  const right = result.rows.map((row) => ({
    cteId: row.hash,
    cteTimeIssued: moment(row.time).unix(),
    cteAmount: {
      getCoin: arraySum(row.outputs_amount),
    },
  }))
  logger.debug('[lastTxs] result calculated')
  return { Right: right }
}

export default {
  addressSummary: {
    method: 'get',
    path: withPrefix('/addresses/summary/:address'),
    handler: addressSummary,
  },
  txSummary: {
    method: 'get',
    path: withPrefix('/txs/summary/:tx'),
    handler: txSummary,
  },
  txRaw: {
    method: 'get',
    path: withPrefix('/txs/raw/:tx'),
    handler: txRaw,
  },
  unspentTxOutputs: {
    method: 'post',
    path: withPrefix('/bulk/addresses/utxo'),
    handler: unspentTxOutputs,
  },
  lastTxs: {
    method: 'get',
    path: withPrefix('/txs/last'),
    handler: lastTxs,
  },
}
