import { runInServer } from './test-utils'
import packageJson from '../../package.json'

describe('Healthcheck endpoint', () => {
  it('Should return package.json version', async () =>
    runInServer(api =>
      api
        .get('/healthcheck')
        .expectValue('version', packageJson.version)
        .end(),
    ))
})
