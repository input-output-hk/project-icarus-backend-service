// @flow
const { runInServer } = require('./test-utils');
const packageJson = require('../../package.json');

describe('Healthcheck endpoint', () => {
  it('Should return package.json version', async () =>
    runInServer(api =>
      api
        .get('/healthcheck')
        .expectValue('version', packageJson.version)
        .end(),
    ));
});
