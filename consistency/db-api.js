// @flow

import type { Pool, ResultSet } from 'pg';

const simpleTest = (db: Pool) => async (): Promise<ResultSet> =>
  db.query('SELECT * FROM txs');

const numberRowsInconsistentTxAddr = (db: Pool) => async (): Promise<ResultSet> =>
  db.query(`
    SELECT COUNT (*)
    FROM
        tx_addresses
        FULL OUTER JOIN
        (SELECT txs.hash as tx_hash, address FROM txs, unnest(txs.inputs_address) address
        union all
        SELECT txs.hash as tx_hash, address FROM txs, unnest(txs.outputs_address) address) as calcTxAddr
          using (tx_hash, address)
        WHERE calcTxAddr.tx_hash IS NULL OR tx_addresses.tx_hash IS NULL`);

module.exports = (db: Pool) => ({
  simpleTest: simpleTest(db),
  numberRowsInconsistentTxAddr: numberRowsInconsistentTxAddr(db),
});
