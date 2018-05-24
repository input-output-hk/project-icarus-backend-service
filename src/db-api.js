// @flow

import type { Pool } from 'pg';

/**
 * Returns the list of addresses that were used at least once (as input or output)
 * @param {Db Object} db
 * @param {Array<Address>} addresses
 */
async function filterUsedAddresses(db: Pool, addresses: Array<string>) {
  return db.query({
    text: 'SELECT DISTINCT address FROM "tx_addresses" WHERE address = ANY($1)',
    values: [addresses],
    rowMode: 'array',
  });
}

/**
 * Queries UTXO table looking for unspents for given addresses
 *
 * @param {Db Object} db
 * @param {Array<Address>} addresses
 */
async function utxoForAddresses(db: Pool, addresses: Array<string>) {
  return db.query('SELECT * FROM "utxos" WHERE receiver = ANY($1)', [
    addresses,
  ]);
}

async function utxoSumForAddresses(db: Pool, addresses: Array<string>) {
  return db.query('SELECT SUM(amount) FROM "utxos" WHERE receiver = ANY($1)', [
    addresses,
  ]);
}

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
async function transactionsHistoryForAddresses(
  db: Pool,
  addresses: Array<string>,
  dateFrom: Date,
  txHash: ?string,
) {
  if (txHash) {
    return db.query(txHistoryQueries.withTxHash, [addresses, dateFrom, txHash]);
  }
  return db.query(txHistoryQueries.withoutTxHash, [addresses, dateFrom]);
}

module.exports = {
  filterUsedAddresses,
  utxoForAddresses,
  utxoSumForAddresses,
  transactionsHistoryForAddresses,
};
