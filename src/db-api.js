/**
 * Returns the list of addresses that were used at least once (as input or output)
 * @param {Db Object} db
 * @param {Array<Address>} addresses
 */
async function filterUsedAddresses(db, addresses) {
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
async function utxoForAddresses(db, addresses) {
  return db.query('SELECT * FROM "utxos" WHERE receiver = ANY($1)', [
    addresses,
  ]);
}

async function utxoSumForAddresses(db, addresses) {
  return db.query('SELECT SUM(amount) FROM "utxos" WHERE receiver = ANY($1)', [
    addresses,
  ]);
}

/**
 * Queries DB looking for transactions including (either inputs or outputs)
 * for the given addresses
 *
 * @param {Db Object} db
 * @param {Array<Address>} addresses
 */
async function transactionsHistoryForAddresses(
  db,
  addresses,
  dateFrom,
  sort,
  limit = 20,
) {
  // We are using sort as string as it cannot be sent as parameter
  const timeSort = sort === 'ASC' || sort === 'DESC' ? sort : 'ASC';
  return db.query(
    `
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
        time > $2
    ORDER BY time ${timeSort}
    LIMIT ${limit}
   `,
    [addresses, dateFrom],
  );
}

module.exports = {
  filterUsedAddresses,
  utxoForAddresses,
  utxoSumForAddresses,
  transactionsHistoryForAddresses,
};
