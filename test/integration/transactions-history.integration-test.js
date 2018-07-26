// @flow
const shuffle = require('shuffle-array');
const { expect } = require('chai');
const { runInServer, assertOnResults } = require('./test-utils');
const moment = require('moment');

const ENDPOINT = '/txs/history';

// To avoid Possible EventEmitter memory leak detected message
process.setMaxListeners(0);

describe('Transaction History endpoint', () => {
  it('should return empty if addresses do not exist', async () =>
    runInServer(api =>
      api
        .post(ENDPOINT)
        .send({
          addresses: [
            'DdzFFzCqrhsfYMUNRxtQ5NNKbWVw3ZJBNcMLLZSoqmD5trHHPBDwsjonoBgw1K6e8Qi8bEMs5Y62yZfReEVSFFMncFYDUHUTMM436KjQ',
            'DdzFFzCqrht4s7speawymCPkm9waYHFSv2zwxhmFqHHQK5FDFt7fd9EBVvm64CrELzxaRGMcygh3gnBrXCtJzzodvzJqVR8VTZqW4rKJ',
          ],
          dateFrom: moment('1995-12-25').toISOString(),
        })
        .expectBody([])
        .end(),
    ));

  it('should return empty if there are no tx after the given address', async () =>
    runInServer(api =>
      api
        .post(ENDPOINT)
        .send({
          addresses: [
            'DdzFFzCqrhsqFM8QxHC4ASk4QLfuoWqbY65GeprG8ezEY6VFkP4jz4C4fcDT57fkUUrPN8E2gaPXiWQxjD3BryptceQEx98ALsrYMoSi',
          ],
          dateFrom: moment('2050-12-25').toISOString(),
        })
        .expectBody([])
        .end(),
    ));

  it('should return history for input and output addresses', async () => {
    const usedAddresses = [
      // Input and Output
      'DdzFFzCqrhsgBCt25t6JArdDHfJZkzzebapE2qqrg1yoquLZzeEyxzhLAb9x7rVf5aby9jwLvL65hH9zTWjbekwzbeYCjJ5pUKn1rYgB',
      // Output
      'DdzFFzCqrhsqFM8QxHC4ASk4QLfuoWqbY65GeprG8ezEY6VFkP4jz4C4fcDT57fkUUrPN8E2gaPXiWQxjD3BryptceQEx98ALsrYMoSi',
    ];

    return runInServer(api =>
      api
        .post(ENDPOINT)
        .send({
          addresses: usedAddresses,
          dateFrom: moment('1995-12-25').toISOString(),
        })
        .expectBody([
          {
            hash: 'e1a958d42f7a064ef447feee5859fd45b8c925de825a7460819f67e8a4f320d0',
            inputs_address: [
              'DdzFFzCqrhsjRXHaGcwLdb82izDN3WNzJpyXnLQ2XPa7PKsuqVWbccKLHymdhgzys117xwosU7Kg8XrqHihHHJNNLDte6WrKq5zJ2Njk',
              'DdzFFzCqrhsjRXHaGcwLdb82izDN3WNzJpyXnLQ2XPa7PKsuqVWbccKLHymdhgzys117xwosU7Kg8XrqHihHHJNNLDte6WrKq5zJ2Njk',
            ],
            inputs_amount: [
              '10000000',
              '10000000',
            ],
            outputs_address: [
              'DdzFFzCqrhsqFM8QxHC4ASk4QLfuoWqbY65GeprG8ezEY6VFkP4jz4C4fcDT57fkUUrPN8E2gaPXiWQxjD3BryptceQEx98ALsrYMoSi',
              'DdzFFzCqrhsxi87yX3WBKVJ37n7frUZjiVTwoc7qxdVeEAoqiRiLUecLngUhgYbc1hfTyzxtwvwSRtGNeWKJfaqMefs4dwybgHmwBj8c',
            ],
            outputs_amount: [
              '4821151',
              '15000000',
            ],
            block_num: '116147',
            time: '2017-10-23T18:03:53.000Z',
            tx_state: 'Successful',
            last_update: '2018-07-13T20:06:04.197Z',
            best_block_num: '1266738',
          },
          {
            hash: 'a8fb2c6cce6d68ea4c65b8301eb26636178c40d3c65071e738d5a4e5cde4d91d',
            inputs_address: [
              'DdzFFzCqrht9SryvcbmahwFFbXkDGzDtuA26Qccf1nQ9bWPmkej9i7q6e9A2bbEVEs2szYJtUupPAQLbh9fANEh1zBLikREmL3XubFAr',
            ],
            inputs_amount: [
              '96599520',
            ],
            outputs_address: [
              'DdzFFzCqrhsgBCt25t6JArdDHfJZkzzebapE2qqrg1yoquLZzeEyxzhLAb9x7rVf5aby9jwLvL65hH9zTWjbekwzbeYCjJ5pUKn1rYgB',
              'DdzFFzCqrhszk2XG2vdMcB3JhkpGTTnMeWvwoE5wHacAu1H38bp5Smr6pxEvJDk5KzeKsTaPSmBVJ24hp2FfqxGDdgH7hp1H1bt5U8Hk',
              'DdzFFzCqrhszk2XG2vdMcB3JhkpGTTnMeWvwoE5wHacAu1H38bp5Smr6pxEvJDk5KzeKsTaPSmBVJ24hp2FfqxGDdgH7hp1H1bt5U8Hk',
              'DdzFFzCqrhszk2XG2vdMcB3JhkpGTTnMeWvwoE5wHacAu1H38bp5Smr6pxEvJDk5KzeKsTaPSmBVJ24hp2FfqxGDdgH7hp1H1bt5U8Hk',
            ],
            outputs_amount: [
              '96421943',
              '1',
              '1',
              '1',
            ],
            block_num: '872076',
            time: '2018-04-17T04:24:13.000Z',
            tx_state: 'Successful',
            last_update: '2018-07-13T21:08:55.778Z',
            best_block_num: '1266738',
          },
          {
            hash: 'de5dbbed46ef5c69f52b3a77ee74585bef07aebcd90383de28348159c697b568',
            inputs_address: [
              'DdzFFzCqrhsgBCt25t6JArdDHfJZkzzebapE2qqrg1yoquLZzeEyxzhLAb9x7rVf5aby9jwLvL65hH9zTWjbekwzbeYCjJ5pUKn1rYgB',
            ],
            inputs_amount: [
              '96421943',
            ],
            outputs_address: [
              'DdzFFzCqrhsrDmGpSbh2LBRmStmMyGznXaeBLoDMSKjLfRuf9DWpLMEzbXw9eQcFsSwNX5sunRuxsJnSZFbu8pTe1qLerrWwwiinEzVe',
              'DdzFFzCqrhstXeWBtWKg1Z189XE5uwwwfbKeUHdacmnD1qMaNqs6Qk3ctZF1frH1wT5PnnJXzLC2fumc9qVWLFp9aMGPEfVzzL6eyKjM',
              'DdzFFzCqrhstXeWBtWKg1Z189XE5uwwwfbKeUHdacmnD1qMaNqs6Qk3ctZF1frH1wT5PnnJXzLC2fumc9qVWLFp9aMGPEfVzzL6eyKjM',
              'DdzFFzCqrhstXeWBtWKg1Z189XE5uwwwfbKeUHdacmnD1qMaNqs6Qk3ctZF1frH1wT5PnnJXzLC2fumc9qVWLFp9aMGPEfVzzL6eyKjM',
            ],
            outputs_amount: [
              '96244366',
              '1',
              '1',
              '1',
            ],
            block_num: '872089',
            time: '2018-04-17T04:28:33.000Z',
            tx_state: 'Successful',
            last_update: '2018-07-13T21:08:55.794Z',
            best_block_num: '1266738',
          },
        ])
        .end(),
    );
  });

  it('should history once even if addresses sent twice', async () => {
    const usedAddresses = [
      'DdzFFzCqrhsqFM8QxHC4ASk4QLfuoWqbY65GeprG8ezEY6VFkP4jz4C4fcDT57fkUUrPN8E2gaPXiWQxjD3BryptceQEx98ALsrYMoSi',
      'DdzFFzCqrhsqFM8QxHC4ASk4QLfuoWqbY65GeprG8ezEY6VFkP4jz4C4fcDT57fkUUrPN8E2gaPXiWQxjD3BryptceQEx98ALsrYMoSi',
    ];

    return runInServer(api =>
      api
        .post(ENDPOINT)
        .send({
          addresses: usedAddresses,
          dateFrom: moment('1995-12-25').toISOString(),
        })
        .expectBody([
          {
            hash:
              'e1a958d42f7a064ef447feee5859fd45b8c925de825a7460819f67e8a4f320d0',
            inputs_address: [
              'DdzFFzCqrhsjRXHaGcwLdb82izDN3WNzJpyXnLQ2XPa7PKsuqVWbccKLHymdhgzys117xwosU7Kg8XrqHihHHJNNLDte6WrKq5zJ2Njk',
              'DdzFFzCqrhsjRXHaGcwLdb82izDN3WNzJpyXnLQ2XPa7PKsuqVWbccKLHymdhgzys117xwosU7Kg8XrqHihHHJNNLDte6WrKq5zJ2Njk',
            ],
            inputs_amount: ['10000000', '10000000'],
            outputs_address: [
              'DdzFFzCqrhsqFM8QxHC4ASk4QLfuoWqbY65GeprG8ezEY6VFkP4jz4C4fcDT57fkUUrPN8E2gaPXiWQxjD3BryptceQEx98ALsrYMoSi',
              'DdzFFzCqrhsxi87yX3WBKVJ37n7frUZjiVTwoc7qxdVeEAoqiRiLUecLngUhgYbc1hfTyzxtwvwSRtGNeWKJfaqMefs4dwybgHmwBj8c',
            ],
            outputs_amount: ['4821151', '15000000'],
            block_num: '116147',
            time: '2017-10-23T18:03:53.000Z',
            best_block_num: '1266738',
            tx_state: 'Successful',
            last_update: '2018-07-13T20:06:04.197Z',
          },
        ])
        .end(),
    );
  });

  it('should history once even if addresses is present in input and output', async () => {
    const usedAddresses = [
      'CYhGP86nCaiEEEUSLWTS3gvAzmLTWM8Nj5CuJyqg5y2iJ1jNhwrZWsNE9n9xsmk5HFDa6DdZcPoXTUEYKddVsqJ1Y',
    ];

    return runInServer(api =>
      api
        .post(ENDPOINT)
        .send({
          addresses: usedAddresses,
          dateFrom: moment('1995-12-25').toISOString(),
        })
        .expect(
          assertOnResults((res, body) => {
            // https://explorer.iohkdev.io/address/CYhGP86nCaiEEEUSLWTS3gvAzmLTWM8Nj5CuJyqg5y2iJ1jNhwrZWsNE9n9xsmk5HFDa6DdZcPoXTUEYKddVsqJ1Y
            expect(body.length).to.equal(3);
          }),
        )
        .end(),
    );
  });

  it('should filter unused addresses', async () => {
    const usedAddresses = [
      'DdzFFzCqrhsqFM8QxHC4ASk4QLfuoWqbY65GeprG8ezEY6VFkP4jz4C4fcDT57fkUUrPN8E2gaPXiWQxjD3BryptceQEx98ALsrYMoSi',
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
        .send({ addresses, dateFrom: moment('1995-12-25').toISOString() })
        .expectBody([
          {
            hash:
              'e1a958d42f7a064ef447feee5859fd45b8c925de825a7460819f67e8a4f320d0',
            inputs_address: [
              'DdzFFzCqrhsjRXHaGcwLdb82izDN3WNzJpyXnLQ2XPa7PKsuqVWbccKLHymdhgzys117xwosU7Kg8XrqHihHHJNNLDte6WrKq5zJ2Njk',
              'DdzFFzCqrhsjRXHaGcwLdb82izDN3WNzJpyXnLQ2XPa7PKsuqVWbccKLHymdhgzys117xwosU7Kg8XrqHihHHJNNLDte6WrKq5zJ2Njk',
            ],
            inputs_amount: ['10000000', '10000000'],
            outputs_address: [
              'DdzFFzCqrhsqFM8QxHC4ASk4QLfuoWqbY65GeprG8ezEY6VFkP4jz4C4fcDT57fkUUrPN8E2gaPXiWQxjD3BryptceQEx98ALsrYMoSi',
              'DdzFFzCqrhsxi87yX3WBKVJ37n7frUZjiVTwoc7qxdVeEAoqiRiLUecLngUhgYbc1hfTyzxtwvwSRtGNeWKJfaqMefs4dwybgHmwBj8c',
            ],
            outputs_amount: ['4821151', '15000000'],
            block_num: '116147',
            time: '2017-10-23T18:03:53.000Z',
            best_block_num: '1266738',
            last_update: '2018-07-13T20:06:04.197Z',
            tx_state: 'Successful',
          },
        ])
        .end(),
    );
  });

  it('should paginate responses', async () => {
    const addresses = [
      'DdzFFzCqrhsjyFvzVsaahmL93VEno1PRkXxUFqJAxRpA52VAyTHVKRGBFyGvGQmr9Ya8kiQF4bmXqTqMZ8G84Krp4xmHkJSvt6txEMXA',
    ];

    let lastDateFrom;

    await runInServer(api =>
      api
        .post(ENDPOINT)
        .send({ addresses, dateFrom: moment('1995-12-25').toISOString() })
        .expect(
          assertOnResults((res, body) => {
            expect(body.length).to.equal(20);
            const lastElem = body[body.length - 1];
            expect(lastElem.hash).to.equal(
              'a3f8d071d027b44571fc9dd50d17edb8c55768d8a7cb8a6709256f146d228ca8',
            );
            lastDateFrom = lastElem.last_update;
          }),
        )
        .end(),
    );

    return runInServer(api =>
      api
        .post(ENDPOINT)
        .send({
          addresses,
          // Paginate from previous response
          dateFrom: lastDateFrom,
        })
        .expect(
          assertOnResults((res, body) => {
            expect(body.length).to.equal(20);
            expect(body[0].hash).to.equal(
              'a3f8d071d027b44571fc9dd50d17edb8c55768d8a7cb8a6709256f146d228ca8',
            );
          }),
        )
        .end(),
    );
  });

  it('should return history for input and output addresses after given date', async () => {
    const usedAddresses = [
      // Input and Output
      'DdzFFzCqrhsgBCt25t6JArdDHfJZkzzebapE2qqrg1yoquLZzeEyxzhLAb9x7rVf5aby9jwLvL65hH9zTWjbekwzbeYCjJ5pUKn1rYgB',
      // Output
      'DdzFFzCqrhsqFM8QxHC4ASk4QLfuoWqbY65GeprG8ezEY6VFkP4jz4C4fcDT57fkUUrPN8E2gaPXiWQxjD3BryptceQEx98ALsrYMoSi',
    ];

    return runInServer(api =>
      api
        .post(ENDPOINT)
        .send({
          addresses: usedAddresses,
          dateFrom: moment('2018-07-13 21:08:55.778082+00').utc(),
        })
        .expectBody([
          {
            hash: 'de5dbbed46ef5c69f52b3a77ee74585bef07aebcd90383de28348159c697b568',
            inputs_address: [
              'DdzFFzCqrhsgBCt25t6JArdDHfJZkzzebapE2qqrg1yoquLZzeEyxzhLAb9x7rVf5aby9jwLvL65hH9zTWjbekwzbeYCjJ5pUKn1rYgB',
            ],
            inputs_amount: [
              '96421943',
            ],
            outputs_address: [
              'DdzFFzCqrhsrDmGpSbh2LBRmStmMyGznXaeBLoDMSKjLfRuf9DWpLMEzbXw9eQcFsSwNX5sunRuxsJnSZFbu8pTe1qLerrWwwiinEzVe',
              'DdzFFzCqrhstXeWBtWKg1Z189XE5uwwwfbKeUHdacmnD1qMaNqs6Qk3ctZF1frH1wT5PnnJXzLC2fumc9qVWLFp9aMGPEfVzzL6eyKjM',
              'DdzFFzCqrhstXeWBtWKg1Z189XE5uwwwfbKeUHdacmnD1qMaNqs6Qk3ctZF1frH1wT5PnnJXzLC2fumc9qVWLFp9aMGPEfVzzL6eyKjM',
              'DdzFFzCqrhstXeWBtWKg1Z189XE5uwwwfbKeUHdacmnD1qMaNqs6Qk3ctZF1frH1wT5PnnJXzLC2fumc9qVWLFp9aMGPEfVzzL6eyKjM',
            ],
            outputs_amount: [
              '96244366',
              '1',
              '1',
              '1',
            ],
            block_num: '872089',
            time: '2018-04-17T04:28:33.000Z',
            tx_state: 'Successful',
            last_update: '2018-07-13T21:08:55.794Z',
            best_block_num: '1266738',
          },
        ])
        .end(),
    );
  });
});
