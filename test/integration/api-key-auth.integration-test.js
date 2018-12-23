// @flow
import restify from 'restify'
import config from 'config'
import apiKeyAuth from '../../build/middleware/api-key-auth'
import { runInServer } from './test-utils'

describe('api key authentication', () => {
  const testEndpoint = '/testApiKey'

  const createServer = () => {
    const server = restify.createServer()
    server.use(apiKeyAuth)
    server.get(`/api/v2${testEndpoint}`, (req, resp, next) => {
      const data = {
        username: req.username,
        authorization: req.authorization,
      }
      resp.send(data)
      next()
    })

    const serverConfig = config.get('server')
    const { logger } = serverConfig

    server.listen(serverConfig.port, () => {
      logger.info('%s listening at %s', server.name, server.url)
    })

    return server
  }

  it('should parse api key from correct Authorization header', async () =>
    runInServer(
      api =>
        api
          .header('Authorization', 'Bearer testApiKey')
          .get(testEndpoint)
          .expectBody({
            username: 'testApiKey',
            authorization: {
              scheme: 'Bearer',
              credentials: 'testApiKey',
            },
          })
          .end(),
      createServer,
    ),
  )

  it('should set anonymous username if Authorization header is missing', async () =>
    runInServer(
      api =>
        api
          .header('x-forwarded-for', '127.0.0.1')
          .get(testEndpoint)
          .expectBody({
            username: 'anonymous-127.0.0.1',
          })
          .end(),
      createServer,
    ),
  )

  it('should return HTTP 400 if Authorization header is incorrect', async () =>
    runInServer(
      api =>
        api
          .header('Authorization', 'invalid-authorization')
          .get(testEndpoint)
          .expectStatus(400)
          .end(),
      createServer,
    ),
  )

  it('should set anonymous username if scheme is incorrect', async () =>
    runInServer(
      api =>
        api
          .header('Authorization', 'Basic dXNlcjpwYXNzd29yZA==')
          .get(testEndpoint)
          .expectBody({ username: 'anonymous-::ffff:127.0.0.1' })
          .end(),
      createServer,
    ),
  )

  it('Authorization header should have priority over ip address', async () =>
    runInServer(
      api =>
        api
          .header('Authorization', 'Bearer testApiKey')
          .header('x-forwarded-for', '127.0.0.1')
          .get(testEndpoint)
          .expectBody({
            username: 'testApiKey',
            authorization: {
              scheme: 'Bearer',
              credentials: 'testApiKey',
            },
          })
          .end(),
      createServer,
    ),
  )
})
