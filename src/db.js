// @flow

import type { PgPoolConfig, Pool } from 'pg';

const PG = require('pg');

module.exports = (dbSettings: PgPoolConfig): Pool => new PG.Pool(dbSettings);
