// @flow

const { Pool } = require('pg');
import type { PgPoolConfig } from 'pg';

module.exports = async (dbSettings: PgPoolConfig) => {
  const pool = new Pool(dbSettings);
  // Test connection
  await pool.query('SELECT NOW()');
  return pool;
};
