/**
 * Queries UTXO table looking for unspents for given addresses
 *
 * @param {Db Object} db
 * @param {Array[Address]} addresses
 */
async function utxoForAddresses(db, addresses) {
  return db.query('SELECT * FROM "utxos" WHERE receiver = ANY($1)', [addresses]);
}

/**
 * Queries DB looking for transactions including (either inputs or outputs)
 * for the given addresses
 *
 * @param {Db Object} db
 * @param {Array[Address]} addresses
 */
async function transactionsHistoryForAddresses(db, addresses) {
  return Promise.resolve([]);
}

module.exports = {
  utxoForAddresses,
  transactionsHistoryForAddresses,
};
