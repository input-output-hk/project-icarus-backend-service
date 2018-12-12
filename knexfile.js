require('dotenv').config()

const env = process.env

const config = {
  client: 'pg',
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB,
  },
  migrations: {
    tableName: 'knex_migrations',
  },
}

module.exports = config
