import { expect } from 'chai'
import shuffle from 'shuffle-array'
import { runInServer, assertOnResults } from './test-utils'

// @flow
// const shuffle = require('shuffle-array')

const ENDPOINT = '/addresses/filterUsed'

describe('FilterUsedAddresses endpoint', () => {
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
    ))

  it('should return used addresses just once', async () => {
    const usedAddresses = [
      'DdzFFzCqrht4wFnWC5TJA5UUVE54JC9xZWq589iKyCrWa6hek3KKevyaXzQt6FsdunbkZGzBFQhwZi1MDpijwRoC7kj1MkEPh2Uu5Ssz',
      'DdzFFzCqrht4wFnWC5TJA5UUVE54JC9xZWq589iKyCrWa6hek3KKevyaXzQt6FsdunbkZGzBFQhwZi1MDpijwRoC7kj1MkEPh2Uu5Ssz',
    ]

    return runInServer(api =>
      api
        .post(ENDPOINT)
        .send({ addresses: usedAddresses })
        .expectBody([usedAddresses[0]])
        .end(),
    )
  })

  it('should filter unused addresses', async () => {
    const usedAddresses = [
      'DdzFFzCqrht4wFnWC5TJA5UUVE54JC9xZWq589iKyCrWa6hek3KKevyaXzQt6FsdunbkZGzBFQhwZi1MDpijwRoC7kj1MkEPh2Uu5Ssz',
      'DdzFFzCqrhtBBX4VvncQ6Zxn8UHawaqSB4jf9EELRBuWUT9gZTmCDWCNTVMotEdof1g26qbrDc8qcHZvtntxR4FaBN1iKxQ5ttjZSZoj',
      'DdzFFzCqrhsvrpQgsnTxPsCAeEUcGTwxUtBv94F2jGGW8s3ZT7V2xPYBAL4renccQQv6bnVtuSr5a5N6cJuAh8Nw58dzZDJTesodN2kV',
      'DdzFFzCqrht9eptGZnVrBCcoLn6fWJF4CS1Dvs8KCKutDXgQ9hdNTEPxFqWwfM3gwpVv3zrLQf7dV7xsUpxLPQKGagGX3CscjWeeTEXz',
    ]

    const unusedAddresses = [
      'DdzFFzCqrhsfYMUNRxtQ5NNKbWVw3ZJBNcMLLZSoqmD5trHHPBDwsjonoBgw1K6e8Qi8bEMs5Y62yZfReEVSFFMncFYDUHUTMM436KjQ',
      'DdzFFzCqrht4s7speawymCPkm9waYHFSv2zwxhmFqHHQK5FDFt7fd9EBVvm64CrELzxaRGMcygh3gnBrXCtJzzodvzJqVR8VTZqW4rKJ',
      'DdzFFzCqrht8d5FeU62PpBw1e3JLUP48LKfDfNtUyfuBJjBEqmgfYpwcbNHCh3csA4DEzu7SYquoUdmkcknR1E1D6zz5byvpMx632VJx',
    ]

    const addresses = shuffle(usedAddresses.concat(unusedAddresses))
    return runInServer(api =>
      api
        .post(ENDPOINT)
        .send({ addresses })
        .expect(
          assertOnResults((res, body) => {
            expect(body).to.have.same.members(usedAddresses)
          }),
        )
        .end(),
    )
  })
})
