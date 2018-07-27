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
    pendingTransactionsForAddresses: sinon.fake.resolves({
      rows: ['ptx1', 'ptx2'],
    }),
  };

  function calledWithError(spy, message) {
    sinon.assert.calledWith(
      spy,
      sinon.match.instanceOf(Error).and(sinon.match.has('message', message)),
    );
  }

  function validateMethodAndPath(endpoint, methodToCheck, pathToCheck) {
    const { method, path } = endpoint;
    assert.equal(methodToCheck, method);
    assert.equal(pathToCheck, path);
  }

  function assertInvalidAddressesPayload(handler) {
    it('should reject bodies without addresses', async () => {
      // $FlowFixMe Ignore this as we are trying invalid payloads
      const response = handler({});
      expect(response).to.be.rejectedWith(
        Error,
        'Addresses request length should be (0, 20]',
      );
    });

    it('should reject bodies with more than 20 addresses', () => {
      const response = handler(
        // $FlowFixMe Ignore this as we are trying invalid payloads
        { body: { addresses: Array(21).fill('an_address') } },
      );
      expect(response).to.be.rejectedWith(
        Error,
        'Addresses request length should be (0, 20]',
      );
    });
  }

  describe('Healthcheck', () => {
    it('should have GET as method and /api/healthcheck as path', () => {
      validateMethodAndPath(routes.healthCheck, 'get', '/api/healthcheck');
    });

    it('should return package.json version as response', async () => {
      const handler = routes.healthCheck.handler();
      const response = await handler();
      expect(response).to.eql({ version: packageJson.version });
    });
  });

  describe('Filter Used Addresses', () => {
    it('should have POST as method and /api/addresses/filterUsed as path', () => {
      validateMethodAndPath(
        routes.filterUsedAddresses,
        'post',
        '/api/addresses/filterUsed',
      );
    });

    assertInvalidAddressesPayload(
      routes.filterUsedAddresses.handler(dbApi, { logger }),
    );

    it('should accept bodies with 20 addresses', async () => {
      const handler = routes.filterUsedAddresses.handler(dbApi, { logger });
      const response = await handler({
        body: { addresses: Array(20).fill('an_address') },
      });
      expect(response).to.eql(['a1', 'a2']);
    });
  });

  describe('UTXO for addresses', () => {
    it('should have POST as method and /txs/utxoForAddresses as path', () => {
      validateMethodAndPath(
        routes.utxoForAddresses,
        'post',
        '/api/txs/utxoForAddresses',
      );
    });

    assertInvalidAddressesPayload(
      routes.utxoForAddresses.handler(dbApi, { logger }),
    );

    it('should accept bodies with 20 addresses', async () => {
      const handler = routes.utxoForAddresses.handler(dbApi, { logger });
      const response = await handler({
        body: { addresses: Array(20).fill('an_address') },
      });
      expect(response).to.eql(['utxo1', 'utxo2']);
    });
  });

  describe('UTXO Sum for addresses', () => {
    it('should have POST as method and /txs/utxoSumForAddresses as path', () => {
      validateMethodAndPath(
        routes.utxoSumForAddresses,
        'post',
        '/api/txs/utxoSumForAddresses',
      );
    });

    assertInvalidAddressesPayload(
      routes.utxoSumForAddresses.handler(dbApi, { logger }),
    );

    it('should accept bodies with 20 addresses', async () => {
      const handler = routes.utxoSumForAddresses.handler(dbApi, { logger });
      const response = await handler({
        body: { addresses: Array(20).fill('an_address') },
      });
      expect(response).to.equal(10);
    });
  });

  describe('Transactions history', () => {
    it('should have POST as method and /txs/history as path', () => {
      validateMethodAndPath(
        routes.transactionsHistory,
        'post',
        '/api/txs/history',
      );
    });

    assertInvalidAddressesPayload(
      routes.transactionsHistory.handler(dbApi, { logger }),
    );

    it('should fail if no dateFrom sent', async () => {
      const handler = routes.transactionsHistory.handler(dbApi, { logger });
      const response = handler({
        body: {
          addresses: ['an_address'],
          // $FlowFixMe ignore this line as we are testing invalid dateFrom
          dateFrom: undefined,
          txHash: 'a_hash',
        },
      });
      expect(response).to.be.rejectedWith(
        Error,
        'DateFrom should be a valid datetime',
      );
    });

    it('should accept valid bodies with txHash', async () => {
      const handler = routes.transactionsHistory.handler(dbApi, { logger });
      const response = await handler({
        body: {
          addresses: Array(20).fill('an_address'),
          dateFrom: new Date(),
          txHash: 'aHash',
        },
      });
      expect(response).to.eql(['tx1', 'tx2']);
    });

    it('should accept valid bodies without txHash', async () => {
      const handler = routes.transactionsHistory.handler(dbApi, { logger });
      const response = await handler({
        body: {
          addresses: Array(20).fill('an_address'),
          dateFrom: new Date(),
          txHash: undefined,
        },
      });
      expect(response).to.eql(['tx1', 'tx2']);
    });
  });

  describe('Pending transactions', () => {
    it('should have POST as method and /txs/pending as path', () => {
      validateMethodAndPath(
        routes.pendingTransactions,
        'post',
        '/api/txs/pending',
      );
    });

    assertInvalidAddressesPayload(
      routes.pendingTransactions.handler(dbApi, { logger }),
    );

    it('should accept bodies with 20 addresses', async () => {
      const handler = routes.pendingTransactions.handler(dbApi, { logger });
      const response = await handler({
        body: {
          addresses: Array(20).fill('an_address'),
        },
      });
      expect(response).to.eql(['ptx1', 'ptx2']);
    });
  });

  describe('Signed Transaction', () => {
    it('should have POST as method and /txs/signed as path', () => {
      validateMethodAndPath(
        routes.signedTransaction,
        'post',
        '/api/txs/signed',
      );
    });

    it('should reject empty bodies', async () => {
      const handler = routes.signedTransaction.handler(dbApi, {
        logger,
        importerSendTxEndpoint: 'fake',
      });
      // $FlowFixMe Ignore this error as we are testing invalid payload
      const request = handler({ body: { signedTx: undefined } });
      expect(request).to.be.rejectedWith(
        Error,
        'Error trying to send transaction',
      );
    });
  });
});
