// @flow

import type { Pool, ResultSet } from 'pg';
import type { DbApi } from 'yoroi-backend'; // eslint-disable-line

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
`;

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
): Promise<ResultSet> => db.query(txHistoryQuery(limit), [addresses, dateFrom]);

module.exports = (db: Pool): DbApi => ({
  filterUsedAddresses: filterUsedAddresses(db),
  unspentAddresses: unspentAddresses(db),
  utxoForAddresses: utxoForAddresses(db),
  utxoSumForAddresses: utxoSumForAddresses(db),
  transactionsHistoryForAddresses: transactionsHistoryForAddresses(db),
});
