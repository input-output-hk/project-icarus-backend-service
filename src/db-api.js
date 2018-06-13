// @flow

import type { Pool, ResultSet } from 'pg';
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
  });

const unspentAddresses = (db: Pool) => async (): Promise<ResultSet> =>
  db.query({
    text: 'SELECT DISTINCT utxos.receiver FROM utxos',
    rowMode: 'array',
  });

/**
 * Queries UTXO table looking for unspents for given addresses
 *
 * @param {Db Object} db
 * @param {Array<Address>} addresses
 */
const utxoForAddresses = (db: Pool) => async (addresses: Array<string>) =>
  db.query('SELECT * FROM "utxos" WHERE receiver = ANY($1)', [addresses]);

const utxoSumForAddresses = (db: Pool) => async (addresses: Array<string>) =>
  db.query('SELECT SUM(amount) FROM "utxos" WHERE receiver = ANY($1)', [
    addresses,
  ]);

// Cached queries
const txHistoryQuery = (extraFilter = '', limit = 20) => `
  SELECT *
  FROM "txs"
  LEFT JOIN (SELECT * from "bestblock" LIMIT 1) f ON true
  WHERE 
    hash = ANY (
      SELECT tx_hash 
      FROM "tx_addresses"
      where address = ANY ($1)
    )
    AND 
      time >= $2
    ${extraFilter}   
  ORDER BY time ASC, hash ASC
  LIMIT ${limit}
`;

const txHistoryQueries = {
  withTxHash: txHistoryQuery('AND hash > $3'),
  withoutTxHash: txHistoryQuery(),
};

/**
 * Queries DB looking for transactions including (either inputs or outputs)
 * for the given addresses
 *
 * @param {Db Object} db
 * @param {Array<Address>} addresses
 */
const transactionsHistoryForAddresses = (db: Pool) => async (
  addresses: Array<string>,
  dateFrom: Date,
  txHash: ?string,
): Promise<ResultSet> => {
  if (txHash) {
    return db.query(txHistoryQueries.withTxHash, [addresses, dateFrom, txHash]);
  }
  return db.query(txHistoryQueries.withoutTxHash, [addresses, dateFrom]);
};

/**
 * Queries DB looking for pending transactions including (either inputs or outputs)
 * for the given addresses
 *
 * @param {Db Object} db
 * @param {Array<Address>} addresses
 */
const pendingTransactionsForAddresses = (db: Pool) => async (
  addresses: Array<string>,
): Promise<ResultSet> =>
  db.query(`
    SELECT * FROM pending_txs
    WHERE hash = ANY (
        SELECT tx_hash FROM ptx_addresses
        WHERE address = ANY($1)
      )
    ORDER BY created_time ASC`, [addresses]);

module.exports = (db: Pool): DbApi => ({
  filterUsedAddresses: filterUsedAddresses(db),
  unspentAddresses: unspentAddresses(db),
  utxoForAddresses: utxoForAddresses(db),
  utxoSumForAddresses: utxoSumForAddresses(db),
  transactionsHistoryForAddresses: transactionsHistoryForAddresses(db),
  pendingTransactionsForAddresses: pendingTransactionsForAddresses(db),
});
