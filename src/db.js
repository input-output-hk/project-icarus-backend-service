// @flow

import type { PgPoolConfig, Pool } from 'pg';

const PG = require('pg');

module.exports = async (dbSettings: PgPoolConfig): Promise<Pool> => {
  const pool = new PG.Pool(dbSettings);
  // Test connection
  await pool.query('SELECT NOW()');
  return pool;
};
