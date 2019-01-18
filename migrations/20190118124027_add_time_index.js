exports.up = async (knex) => knex.schema.table('txs', (table) => {
  table.index('time')
})

exports.down = async (knex) => knex.schema.table('txs', (table) => {
  table.dropIndex('time')
})

