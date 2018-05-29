// @flow

const { Pool } = require('pg');

module.exports = async function queryPool(dbSettings: Pool) {
  const pool = new Pool(dbSettings);
  // Test connection
  await pool.query('SELECT NOW()');
  return pool;
};