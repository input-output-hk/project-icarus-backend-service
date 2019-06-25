// @flow
import type { Pool } from 'pg' // eslint-disable-line
import { merge } from 'lodash' // eslint-disable-line
import { Server as WebSocketServer } from 'ws'
import corsMiddleware from 'restify-cors-middleware'
import restifyBunyanLogger from 'restify-bunyan-logger'
import restify from 'restify'
import config from 'config'
import routes from './routes'
import legacyRoutes from './legacy-routes'
import importerApi from './importer-api'
import dbApi from './db-api'
import manageConnections from './ws-connections'
import createDB from './db'
import configCleanup from './cleanup'
import healthCheck from './healthcheck'
import responseGuard from './middleware/response-guard'

const serverConfig = config.get('server')
const {
  logger, importerSendTxEndpoint, disableHealthcheck, corsEnabledFor, allowCredentials,
} = serverConfig

async function createServer() {
  const db = await createDB(config.get('db'))

  logger.info('Connected to db')

  const server = restify.createServer({
    log: logger,
    maxParamLength: 1000, // default is 100 which is too short for Daedalus addresses
  })

  if (!disableHealthcheck) {
    healthCheck(db)
  }

  const cors = corsMiddleware({ origins: corsEnabledFor, credentials: allowCredentials })
  server.pre(cors.preflight)
  server.use(cors.actual)
  server.use(restify.plugins.bodyParser())
  server.use(responseGuard)
  server.use(restify.plugins.throttle({
    burst: 50,
    rate: 10,
    ip: false,
    xff: true,
    setHeaders: true,
  }))
  server.on('after', restifyBunyanLogger())
  server.use(restify.plugins.gzipResponse())

  Object.values(merge(routes, legacyRoutes)).forEach(({ method, path, handler }: any) => {
    server[method](path, async (req, res, next) => {
      try {
        const result = await handler(
          dbApi(db),
          serverConfig,
          importerApi(importerSendTxEndpoint),
        )(req)
        res.send(result)
        next()
      } catch (err) {
        next(err)
      }
    })
  })

  const wss = new WebSocketServer({ server })
  wss.on('connection', manageConnections(dbApi(db), serverConfig))

  configCleanup(db, logger)

  server.listen(serverConfig.port, () => {
    logger.info('%s listening at %s', server.name, server.url)
  })

  return server
}

export default createServer
