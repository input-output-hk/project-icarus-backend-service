const { Pool } = require('pg');

module.exports = async (dbSettings) => {
  const pool = new Pool(dbSettings);
  // Test connection
  await pool.query('SELECT NOW()');
  return pool;
};
