// @flow
import type { Hippie } from 'hippie';

// $FlowFixMe Fix this assignment as it throws an error
const hippie: Hippie = require('hippie');
const createServer = require('../../src/server');

function api(server): Hippie {
  return hippie(server)
    .json()
    .base('http://localhost:8080/api');
}

/**
 * This function starts a server and executes test endpoint function on it
 * @param {function} testEndpoint Hippie functions to be called
 */
async function runInServer(testEndpoint: Hippie => Promise<boolean>) {
  const server = await createServer();
  let promise;
  try {
    await testEndpoint(api(server));
  } finally {
    promise = new Promise(resolve => {
      server.close(() => resolve(true));
    });
  }
  return promise;
}

/**
 * Helper in order to use chai assertions with hippie expect function
 * It will call next if no errors, next(err) if an assertion thrown
 * @param {function} assertionsFn Set of assertions.
 */
const assertOnResults = (assertionsFn: (Object, Object, Function) => void) => (
  res: Object,
  body: Object,
  next: Function,
) => {
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
