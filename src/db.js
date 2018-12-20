// @flow

import type { PgPoolConfig, Pool } from 'pg'
import PG from 'pg'

export default (dbSettings: PgPoolConfig): Pool => new PG.Pool(dbSettings)
