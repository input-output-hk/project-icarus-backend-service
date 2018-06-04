// @flow
const shuffle = require('shuffle-array');
const { runInServer } = require('./test-utils');

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
    ];

    const unusedAddresses = [
      'DdzFFzCqrhsfYMUNRxtQ5NNKbWVw3ZJBNcMLLZSoqmD5trHHPBDwsjonoBgw1K6e8Qi8bEMs5Y62yZfReEVSFFMncFYDUHUTMM436KjQ',
      'DdzFFzCqrht4s7speawymCPkm9waYHFSv2zwxhmFqHHQK5FDFt7fd9EBVvm64CrELzxaRGMcygh3gnBrXCtJzzodvzJqVR8VTZqW4rKJ',
      'DdzFFzCqrht8d5FeU62PpBw1e3JLUP48LKfDfNtUyfuBJjBEqmgfYpwcbNHCh3csA4DEzu7SYquoUdmkcknR1E1D6zz5byvpMx632VJx',
    ];

    const addresses = shuffle(usedAddresses.concat(unusedAddresses));
    return runInServer(api =>
      api
        .post(ENDPOINT)
        .send({ addresses })
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
});
