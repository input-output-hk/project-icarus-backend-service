// @flow
const assert = require('assert');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const Bunyan = require('bunyan');
const routes = require('../../src/routes');
const packageJson = require('../../package.json');

chai.use(chaiAsPromised);
const { expect } = chai;

// eslint-disable-next-line new-cap
const logger = new Bunyan.createLogger({
  name: 'test',
  // $FlowFixMe Doesn't like string literal
  level: 'fatal',
});

const apiConfig = { addressesRequestLimit: 50, txHistoryResponseLimit: 20 };

describe('Routes', () => {
  // This returns fake data. It's ok if they are not real objects (for example utxo or txs)
  // as we are checking the response is being returned, not the queries
  const dbApi = {
    filterUsedAddresses: sinon.fake.resolves({ rows: [['a1', 'a2']] }),
    utxoForAddresses: sinon.fake.resolves({ rows: ['utxo1', 'utxo2'] }),
    utxoSumForAddresses: sinon.fake.resolves({ rows: [10, 20] }),
    transactionsHistoryForAddresses: sinon.fake.resolves({
      rows: ['tx1', 'tx2'],
    }),
    unspentAddresses: sinon.fake.resolves([]),
  };

  function validateMethodAndPath(endpoint, methodToCheck, pathToCheck) {
    const { method, path } = endpoint;
    assert.equal(methodToCheck, method);
    assert.equal(pathToCheck, path);
  }

  function assertInvalidAddressesPayload(handler) {
    it('should reject bodies without addresses', () => {
      // $FlowFixMe Ignore this as we are trying invalid payloads
      const response = handler({});
      return expect(response).to.be.rejectedWith(
        Error,
        `Addresses request length should be (0, ${
          apiConfig.addressesRequestLimit
        }]`,
      );
    });

    it(`should reject bodies with more than ${
      apiConfig.addressesRequestLimit
    } addresses`, () => {
      const response = handler(
        // $FlowFixMe Ignore this as we are trying invalid payloads
        { body: { addresses: Array(apiConfig.addressesRequestLimit + 1).fill('an_address') } },
      );
      return expect(response).to.be.rejectedWith(
        Error,
        `Addresses request length should be (0, ${
          apiConfig.addressesRequestLimit
        }]`,
      );
    });
  }

  describe('Healthcheck', () => {
    it('should have GET as method and /api/v2/healthcheck as path', () => {
      validateMethodAndPath(routes.healthCheck, 'get', '/api/v2/healthcheck');
    });

    it('should return package.json version as response', async () => {
      const handler = routes.healthCheck.handler();
      const response = await handler();
      return expect(response).to.eql({ version: packageJson.version });
    });
  });

  describe('Filter Used Addresses', () => {
    it('should have POST as method and /api/v2/addresses/filterUsed as path', () => {
      validateMethodAndPath(
        routes.filterUsedAddresses,
        'post',
        '/api/v2/addresses/filterUsed',
      );
    });

    assertInvalidAddressesPayload(
      routes.filterUsedAddresses.handler(dbApi, { logger, apiConfig }),
    );

    it('should accept bodies with 20 addresses', async () => {
      const handler = routes.filterUsedAddresses.handler(dbApi, {
        logger,
        apiConfig,
      });
      const response = await handler({
        body: { addresses: Array(20).fill('an_address') },
      });
      return expect(response).to.eql(['a1', 'a2']);
    });
  });

  describe('UTXO for addresses', () => {
    it('should have POST as method and /api/v2/txs/utxoForAddresses as path', () => {
      validateMethodAndPath(
        routes.utxoForAddresses,
        'post',
        '/api/v2/txs/utxoForAddresses',
      );
    });

    assertInvalidAddressesPayload(
      routes.utxoForAddresses.handler(dbApi, { logger, apiConfig }),
    );

    it('should accept bodies with 20 addresses', async () => {
      const handler = routes.utxoForAddresses.handler(dbApi, {
        logger,
        apiConfig,
      });
      const response = await handler({
        body: { addresses: Array(20).fill('an_address') },
      });
      return expect(response).to.eql(['utxo1', 'utxo2']);
    });
  });

  describe('UTXO Sum for addresses', () => {
    it('should have POST as method and api/v2//txs/utxoSumForAddresses as path', () => {
      validateMethodAndPath(
        routes.utxoSumForAddresses,
        'post',
        '/api/v2/txs/utxoSumForAddresses',
      );
    });

    assertInvalidAddressesPayload(
      routes.utxoSumForAddresses.handler(dbApi, { logger, apiConfig }),
    );

    it('should accept bodies with 20 addresses', async () => {
      const handler = routes.utxoSumForAddresses.handler(dbApi, {
        logger,
        apiConfig,
      });
      const response = await handler({
        body: { addresses: Array(20).fill('an_address') },
      });
      return expect(response).to.equal(10);
    });
  });

  describe('Transactions history', () => {
    it('should have POST as method and /api/v2/txs/history as path', () => {
      validateMethodAndPath(
        routes.transactionsHistory,
        'post',
        '/api/v2/txs/history',
      );
    });

    assertInvalidAddressesPayload(
      routes.transactionsHistory.handler(dbApi, { logger, apiConfig }),
    );

    it('should fail if no dateFrom sent', async () => {
      const handler = routes.transactionsHistory.handler(dbApi, {
        logger,
        apiConfig,
      });
      const response = handler({
        body: {
          addresses: ['an_address'],
          // $FlowFixMe ignore this line as we are testing invalid dateFrom
          dateFrom: undefined,
        },
      });
      return expect(response).to.be.rejectedWith(
        Error,
        'DateFrom should be a valid datetime',
      );
    });
  });

  describe('Signed Transaction', () => {
    it('should have POST as method and /api/v2/txs/signed as path', () => {
      validateMethodAndPath(
        routes.signedTransaction,
        'post',
        '/api/v2/txs/signed',
      );
    });

    it('should send a given signed tx', async () => {
      const importerApi = {
        sendTx: sinon.fake.resolves({ status: 200, data: { Right: [] } }),
      };
      const handler = routes.signedTransaction.handler(dbApi, {
        logger,
      }, importerApi);
      const response = await handler({ body: { signedTx: 'signedTx' } });
      return expect(response.length).to.equal(0);
    });

    it('should reject empty bodies', async () => {
      const importerApi = {
        sendTx: sinon.fake.resolves(),
      };
      const handler = routes.signedTransaction.handler(dbApi, {
        logger,
      }, importerApi);
      // $FlowFixMe Ignore this error as we are testing invalid payload
      const request = handler({ body: { signedTx: undefined } });
      return expect(request).to.be.rejectedWith(
        Error,
        'Signed transaction missing',
      );
    });

    it('should reject on importer error', async () => {
      const importerApi = {
        sendTx: sinon.fake.rejects(),
      };
      const handler = routes.signedTransaction.handler(dbApi, {
        logger,
      }, importerApi);
      // $FlowFixMe Ignore this error as we are testing invalid payload
      const request = handler({ body: { signedTx: 'fakeSignedTx' } });
      return expect(request).to.be.rejectedWith(
        Error,
        'Error trying to connect with importer',
      );
    });

    it('should reject on invalid transaction', async () => {
      const importerApi = {
        sendTx: sinon.fake.resolves({ status: 200, data: { Left: 'Error' } }),
      };
      const handler = routes.signedTransaction.handler(dbApi, {
        logger,
      }, importerApi);
      // $FlowFixMe Ignore this error as we are testing invalid payload
      const request = handler({ body: { signedTx: 'fakeSignedTx' } });
      return expect(request).to.be.rejectedWith(
        Error,
        'Error processing transaction',
      );
    });

    it('should reject on invalid witness', async () => {
      const invalidWitnessError = 'Tx not broadcasted 3cb8547f391537ba: input #0\'s witness'
        + ' doesn\'t pass verification:\n  witness: PkWitness: key = pub:0ff1c324, key'
        + ' hash = 04666a4a, sig = <signature>\n  reason: the signature in the witness doesn\'t'
        + ' pass validation';
      const importerApi = {
        sendTx: sinon.fake.resolves({ status: 200, data: { Left: invalidWitnessError } }),
      };
      const handler = routes.signedTransaction.handler(dbApi, {
        logger,
      }, importerApi);
      const request = handler({ body: { signedTx: 'fakeSignedTx' } });
      return expect(request).to.be.rejectedWith(
        Error,
        'Invalid witness',
      );
    });
  });
});
