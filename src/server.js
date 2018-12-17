// @flow
import type { Pool } from 'pg' // eslint-disable-line
import { merge } from 'lodash' // eslint-disable-line
import { readFileSync } from 'fs'
import { join } from 'path'
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
import apiKeyAuth from './middleware/api-key-auth'

const serverConfig = config.get('server')
const { logger, importerSendTxEndpoint } = serverConfig

function addHttps(defaultRestifyConfig) {
  const TLS_DIR = join(
    serverConfig.https.tlsDir,
    process.env.NODE_ENV ? process.env.NODE_ENV : '',
  )
  const httpsConfig = {
    certificate: readFileSync(`${TLS_DIR}/server.crt`),
    key: readFileSync(`${TLS_DIR}/server.key`),
    ca: readFileSync(`${TLS_DIR}/ca.pem`),
  }
  return Object.assign({}, defaultRestifyConfig, httpsConfig)
}

async function createServer() {
  const db = await createDB(config.get('db'))
  logger.info('Connected to db')

  const defaultRestifyConfig = {
    log: logger,
    maxParamLength: 1000, // default is 100 (too short for Daedalus addresses)
  }

  const restifyConfig = serverConfig.https
    ? addHttps(defaultRestifyConfig)
    : defaultRestifyConfig

  const server = restify.createServer(restifyConfig)

  const cors = corsMiddleware({ origins: serverConfig.corsEnabledFor })
  server.pre(cors.preflight)
  server.use(cors.actual)
  server.use(restify.plugins.bodyParser())
  server.use(apiKeyAuth)
  server.use(restify.plugins.throttle({
    burst: 50,
    rate: 10,
    ip: false,
    xff: false,
    username: true,
    setHeaders: true,
  }))
  server.on('after', restifyBunyanLogger())

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
