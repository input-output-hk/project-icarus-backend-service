/**
 * Queries UTXO table looking for unspents for given addresses
 *
 * @param {Db Object} db
 * @param {Array[Address]} addresses
 */
async function utxoForAddresses(db, addresses) {
  return Promise.resolve([
    {
      tx_index: 0,
      tx_hash:
        'e2a148fe48c72eb7fe1af23f7d89a38af05590531b5440a51501b97e9994643f',
      receiver:
        'CYhGP86nCaiBf47Q9VwWWqtJ2DKBnpXNkCgNpBjJDWdkcHkHyEPjasSq4pHVBB7ASWoTi7dSXxNXgtmLMYRc618qJ',
      value: 1,
    },
    {
      tx_index: 1,
      tx_hash:
        'e2a148fe48c72eb7fe1af23f7d89a38af05590531b5440a51501b97e9994643f',
      receiver:
        'CYhGP86nCaiBf47Q9VwWWqtJ2DKBnpXNkCgNpBjJDWdkcHkHyEPjasSq4pHVBB7ASWoTi7dSXxNXgtmLMYRc618qJ',
      value: 652541,
    },
  ]);
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
