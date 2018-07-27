// @flow
const shuffle = require('shuffle-array');
const { expect } = require('chai');
const { runInServer, assertOnResults } = require('./test-utils');

const ENDPOINT = '/txs/utxoForAddresses';

describe('UtxoForAddresses endpoint', () => {
  it('should return empty if addresses do not exist', async () =>
    runInServer(api =>
      api
        .post(ENDPOINT)
        .send({
          addresses: [
            'DdzFFzCqrhsfYMUNRxtQ5NNKbWVw3ZJBNcMLLZSoqmD5trHHPBDwsjonoBgw1K6e8Qi8bEMs5Y62yZfReEVSFFMncFYDUHUTMM436KjQ',
            'DdzFFzCqrht4s7speawymCPkm9waYHFSv2zwxhmFqHHQK5FDFt7fd9EBVvm64CrELzxaRGMcygh3gnBrXCtJzzodvzJqVR8VTZqW4rKJ',
          ],
        })
        .expectBody([])
        .end(),
    ));

  it('should return data for addresses balance once even if sent twice', async () => {
    const usedAddresses = [
      'DdzFFzCqrhshvqw9GrHmSw6ySwViBj5cj2njWj5mbnLu4uNauJCKuXhHS3wNUoGRNBGGTkyTFDQNrUWMumZ3mxarAjoXiYvyhead7yKQ',
      'DdzFFzCqrhshvqw9GrHmSw6ySwViBj5cj2njWj5mbnLu4uNauJCKuXhHS3wNUoGRNBGGTkyTFDQNrUWMumZ3mxarAjoXiYvyhead7yKQ',
    ];

    return runInServer(api =>
      api
        .post(ENDPOINT)
        .send({ addresses: usedAddresses })
        .expectBody([
          {
            utxo_id:
              '6cc6d736e3a4395acabfae4c7cfe409b65d8c7c6bbf9ff85a0bd4a95334b7a5f0',
            tx_hash:
              '6cc6d736e3a4395acabfae4c7cfe409b65d8c7c6bbf9ff85a0bd4a95334b7a5f',
            tx_index: 0,
            receiver:
              'DdzFFzCqrhshvqw9GrHmSw6ySwViBj5cj2njWj5mbnLu4uNauJCKuXhHS3wNUoGRNBGGTkyTFDQNrUWMumZ3mxarAjoXiYvyhead7yKQ',
            amount: '1463071700828754',
          },
        ])
        .end(),
    );
  });

  it('should filter unused addresses', async () => {
    const usedAddresses = [
      'DdzFFzCqrhshvqw9GrHmSw6ySwViBj5cj2njWj5mbnLu4uNauJCKuXhHS3wNUoGRNBGGTkyTFDQNrUWMumZ3mxarAjoXiYvyhead7yKQ',
      'DdzFFzCqrhskrzzPrXynkZ3gteGy8GmWYrswqz9SueoFP9PV5suFnGv9sQqg3o5pxzFpDTJ2HFJzHrThxBYarQi8guzMUhuiePB1T6ff',
    ];

    const unusedAddresses = [
      'DdzFFzCqrhsfYMUNRxtQ5NNKbWVw3ZJBNcMLLZSoqmD5trHHPBDwsjonoBgw1K6e8Qi8bEMs5Y62yZfReEVSFFMncFYDUHUTMM436KjQ',
      'DdzFFzCqrht4s7speawymCPkm9waYHFSv2zwxhmFqHHQK5FDFt7fd9EBVvm64CrELzxaRGMcygh3gnBrXCtJzzodvzJqVR8VTZqW4rKJ',
      'DdzFFzCqrht8d5FeU62PpBw1e3JLUP48LKfDfNtUyfuBJjBEqmgfYpwcbNHCh3csA4DEzu7SYquoUdmkcknR1E1D6zz5byvpMx632VJx',
    ];

    const expectedUTOXs = [
      {
        utxo_id:
          '6cc6d736e3a4395acabfae4c7cfe409b65d8c7c6bbf9ff85a0bd4a95334b7a5f0',
        tx_hash:
          '6cc6d736e3a4395acabfae4c7cfe409b65d8c7c6bbf9ff85a0bd4a95334b7a5f',
        tx_index: 0,
        receiver:
          'DdzFFzCqrhshvqw9GrHmSw6ySwViBj5cj2njWj5mbnLu4uNauJCKuXhHS3wNUoGRNBGGTkyTFDQNrUWMumZ3mxarAjoXiYvyhead7yKQ',
        amount: '1463071700828754',
      },
      {
        utxo_id:
          'aba9ad6b8360542698038dea31ca23037ad933c057abc18c5c17c2c63dbc3d131',
        tx_hash:
          'aba9ad6b8360542698038dea31ca23037ad933c057abc18c5c17c2c63dbc3d13',
        tx_index: 1,
        receiver:
          'DdzFFzCqrhskrzzPrXynkZ3gteGy8GmWYrswqz9SueoFP9PV5suFnGv9sQqg3o5pxzFpDTJ2HFJzHrThxBYarQi8guzMUhuiePB1T6ff',
        amount: '9829100',
      },
    ];

    const addresses = shuffle(usedAddresses.concat(unusedAddresses));
    return runInServer(api =>
      api
        .post(ENDPOINT)
        .send({ addresses })
        .expect(
          assertOnResults((res, body) => {
            expect(body).to.have.same.deep.members(expectedUTOXs);
          }),
        )
        .end(),
    );
  });
});
