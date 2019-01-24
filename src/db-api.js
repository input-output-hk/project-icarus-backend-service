// @flow

import type { Pool, ResultSet } from 'pg'
import type { DbApi } from 'icarus-backend'; // eslint-disable-line

/**
 * Returns the list of addresses that were used at least once (as input or output)
 * @param {Db Object} db
 * @param {Array<Address>} addresses
 */
const filterUsedAddresses = (db: Pool) => async (
  addresses: Array<string>,
): Promise<ResultSet> =>
  db.query({
    text: 'SELECT DISTINCT address FROM "tx_addresses" WHERE address = ANY($1)',
    values: [addresses],
    rowMode: 'array',
  })

const unspentAddresses = (db: Pool) => async (): Promise<ResultSet> =>
  db.query({
    text: 'SELECT DISTINCT utxos.receiver FROM utxos',
    rowMode: 'array',
  })

/**
 * Queries UTXO table looking for unspents for given addresses
 *
 * @param {Db Object} db
 * @param {Array<Address>} addresses
 */
const utxoForAddresses = (db: Pool) => async (addresses: Array<string>) =>
  db.query('SELECT * FROM "utxos" WHERE receiver = ANY($1)', [addresses])

const utxoSumForAddresses = (db: Pool) => async (addresses: Array<string>) =>
  db.query('SELECT SUM(amount) FROM "utxos" WHERE receiver = ANY($1)', [
    addresses,
  ])

// Cached queries
const txHistoryQuery = (limit: number) => `
  SELECT *
  FROM "txs"
  LEFT JOIN (SELECT * from "bestblock" LIMIT 1) f ON true
  WHERE 
    hash = ANY (
      SELECT tx_hash 
      FROM "tx_addresses"
      where address = ANY ($1)
    )
    AND last_update >= $2
  ORDER BY last_update ASC
  LIMIT ${limit}
`

/**
 * Queries DB looking for transactions including (either inputs or outputs)
 * for the given addresses
 *
 * @param {Db Object} db
 * @param {Array<Address>} addresses
 */
const transactionsHistoryForAddresses = (db: Pool) => async (
  limit: number,
  addresses: Array<string>,
  dateFrom: Date,
): Promise<ResultSet> => db.query(txHistoryQuery(limit), [addresses, dateFrom])

// The remaining queries should be used only for the purposes of the legacy API!

/**
 * Queries DB looking for successful transactions associated with the given address
 * @param {Db Object} db
 * @param {Address} address
 */
const addressSummary = (db: Pool) => async (address: string): Promise<ResultSet> =>
  db.query({
    text: 'SELECT * FROM "txs" WHERE hash = ANY (SELECT tx_hash from "tx_addresses" WHERE address = $1) AND tx_state = $2',
    values: [address, 'Successful'],
  })

/**
* Queries TXS table looking for a successful transaction with a given hash
* @param {Db Object} db
* @param {*} tx
*/
const txSummary = (db: Pool) => async (tx: string): Promise<ResultSet> =>
  db.query({
    text: 'SELECT * FROM "txs" WHERE hash = $1 AND tx_state = $2',
    values: [tx, 'Successful'],
  })

/**
 * Queries UTXO table looking for unspents for given addresses and renames the columns
 * @param {Db Object} db
 * @param {Array<Address>} addresses
 */
const utxoLegacy = (db: Pool) => async (addresses: Array<string>): Promise<ResultSet> =>
  db.query({
    text: `SELECT 'CUtxo' AS "tag", tx_hash AS "cuId", tx_index AS "cuOutIndex", receiver AS "cuAddress", amount AS "cuCoins"
      FROM "utxos"
      WHERE receiver = ANY($1)`,
    values: [addresses],
  })

  /**
* Queries TXS table for the last 20 transactions
* @param {Db Object} db
*/
const lastTxs = (db: Pool) => async (): Promise<ResultSet> =>
  db.query({
    text: `SELECT * FROM "txs"
      ORDER BY "time" DESC
      LIMIT 20`,
  })

const bestBlock = (db: Pool) => async (): Promise<any> => {
  const query = await db.query('SELECT * FROM "bestblock"')
  return query.rows[0].best_block_num
}

export default (db: Pool): DbApi => ({
  filterUsedAddresses: filterUsedAddresses(db),
  unspentAddresses: unspentAddresses(db),
  utxoForAddresses: utxoForAddresses(db),
  utxoSumForAddresses: utxoSumForAddresses(db),
  transactionsHistoryForAddresses: transactionsHistoryForAddresses(db),
  bestBlock: bestBlock(db),
  // legacy
  addressSummary: addressSummary(db),
  txSummary: txSummary(db),
  utxoLegacy: utxoLegacy(db),
  lastTxs: lastTxs(db),
})
