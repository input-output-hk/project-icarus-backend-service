// @flow

const hippie = require('hippie');
const createServer = require('../../src/server');

function api(server) {
  return hippie(server)
    .json()
    .base('http://localhost:8080/api');
}

/**
 * This function starts a server and executes test endpoint function on it
 * @param {function} testEndpoint Hippie functions to be called
 */
async function runInServer(testEndpoint) {
  const server = await createServer();
  let promise;
  try {
    await testEndpoint(api(server));
  } finally {
    promise = new Promise(resolve => {
      server.close(() => resolve());
    });
  }
  return promise;
}

/**
 * Helper in order to use chai assertions with hippie expect function
 * @param {function} assertionsFn Set of assertions. It will fail the expectation if exception is returned
 */
const assertOnResults = assertionsFn => (res, body, next) => {
  try {
    assertionsFn(res, body, next);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  runInServer,
  assertOnResults,
};
