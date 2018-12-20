const config = require('config')
const ApiBuilder = require('claudia-api-builder')
const pg = require('pg')
const routes = require('./build/routes')
const dbApi = require('./build/db-api')
const importerApi = require('./build/importer-api')

const serverConfig = config.get('server')
const { importerSendTxEndpoint } = serverConfig
const api = new ApiBuilder()

Object.values(routes).forEach(({ method, path, handler }) => {
  api[method](path, async req => {
    const db = new pg.Client(config.get('db'))
    await db.connect()
    try {
      return await handler(
        dbApi(db),
        serverConfig,
        importerApi(importerSendTxEndpoint),
      )(req)
    } finally {
      db.end()
    }
  })
})

module.exports = api
