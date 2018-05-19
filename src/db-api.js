/**
 * Queries UTXO table looking for unspents for given addresses
 *
 * @param {Db Object} db
 * @param {Array[Address]} addresses
 */
async function utxoForAddresses(db, addresses) {
  return db.query(
    'SELECT * FROM "utxos" WHERE receiver = ANY(VALUES (\'a\'))',
    [addresses],
  );
}

async function utxoSumForAddresses(db, addresses) {
  const params = addresses.map((v, i) => `($${i + 1})`);
  return db.query(
    `SELECT SUM(amount) FROM "utxos" WHERE receiver = ANY(VALUES ${params.join(',')})`,
    addresses,
  );
}

/**
 * Queries DB looking for transactions including (either inputs or outputs)
 * for the given addresses
 *
 * @param {Db Object} db
 * @param {Array[Address]} addresses
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
        time >= $2
    ORDER BY time ${timeSort}
    LIMIT ${limit}
   `,
    [addresses, dateFrom],
  );
}

module.exports = {
  utxoForAddresses,
  utxoSumForAddresses,
  transactionsHistoryForAddresses,
};
