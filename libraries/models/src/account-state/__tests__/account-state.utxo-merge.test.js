import UtxoCollection from '../../utxo-collection/index.js'
import AccountState from '../index.js'
import { utxosFixture3, utxosFixture1, utxosFixture2, utxosFixtureBitcoin } from './fixtures.js'
import { bitcoin, cardano } from '../../__tests__/_fixtures-currencies.js'

export class HelloAccountState extends AccountState {
  static defaults = {
    utxos: UtxoCollection.createEmpty({ currency: cardano }),
    tokenUtxos: {},
  }
}

test('create with empty data', () => {
  const result = HelloAccountState.create()
  expect(result.utxos.size).toEqual(0)
  expect(result.tokenUtxos).toEqual({})
})

test('merge utxos 3 times', () => {
  const result = HelloAccountState.create({})
  expect(result.utxos.size).toEqual(0)

  const firstMerge = result.merge({
    utxos: UtxoCollection.fromJSON(utxosFixture1, { currency: cardano }),
  })

  expect(firstMerge.utxos.size).toEqual(2)
  expect(firstMerge.utxos.toArray().map((utxo) => utxo.txId)).toEqual([
    'a7fb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
    '7de99b2367587e121f08e2a95150fbd0939158358181f0a6c3dcd935ac5c0399',
  ])

  const secondMerge = firstMerge.merge({
    utxos: UtxoCollection.fromJSON(utxosFixture2, { currency: cardano }),
  })

  expect(secondMerge.utxos.size).toEqual(1)
  expect(secondMerge.utxos.toArray().map((utxo) => utxo.txId)).toEqual([
    'a7fb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
  ])

  const thirdMerge = secondMerge.merge({
    utxos: UtxoCollection.fromJSON(utxosFixture3, { currency: cardano }),
  })
  expect(thirdMerge.utxos.size).toEqual(2)
  expect(thirdMerge.utxos.toArray().map((utxo) => utxo.txId)).toEqual([
    '17fb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
    '2de99b2367587e121f08e2a95150fbd0939158358181f0a6c3dcd935ac5c0399',
  ])
})

test('merge tokenUtxos 3 times', () => {
  const result = HelloAccountState.create({})

  expect(result.utxos.size).toEqual(0)

  const firstMerge = result.merge({
    tokenUtxos: { cardano: UtxoCollection.fromJSON(utxosFixture1, { currency: cardano }) },
  })

  expect(firstMerge.tokenUtxos.cardano.size).toEqual(2)
  expect(firstMerge.tokenUtxos.cardano.toArray().map((utxo) => utxo.txId)).toEqual([
    'a7fb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
    '7de99b2367587e121f08e2a95150fbd0939158358181f0a6c3dcd935ac5c0399',
  ])

  const secondMerge = firstMerge.merge({
    tokenUtxos: { cardano: UtxoCollection.fromJSON(utxosFixture2, { currency: cardano }) },
  })

  expect(secondMerge.tokenUtxos.cardano.size).toEqual(1)
  expect(secondMerge.tokenUtxos.cardano.toArray().map((utxo) => utxo.txId)).toEqual([
    'a7fb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
  ])

  const thirdMerge = secondMerge.merge({
    tokenUtxos: { cardano: UtxoCollection.fromJSON(utxosFixture3, { currency: cardano }) },
  })
  expect(thirdMerge.tokenUtxos.cardano.size).toEqual(2)
  expect(thirdMerge.tokenUtxos.cardano.toArray().map((utxo) => utxo.txId)).toEqual([
    '17fb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
    '2de99b2367587e121f08e2a95150fbd0939158358181f0a6c3dcd935ac5c0399',
  ])
})

test('merge tokenUtxos 3 times using different tokens', () => {
  const result = HelloAccountState.create({})

  expect(result.utxos.size).toEqual(0)

  const firstMerge = result.merge({
    tokenUtxos: { cardano: UtxoCollection.fromJSON(utxosFixture1, { currency: cardano }) },
  })

  expect(Object.keys(firstMerge.tokenUtxos)).toEqual(['cardano'])
  expect(firstMerge.tokenUtxos.cardano.size).toEqual(2)
  expect(firstMerge.tokenUtxos.cardano.toArray().map((utxo) => utxo.txId)).toEqual([
    'a7fb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
    '7de99b2367587e121f08e2a95150fbd0939158358181f0a6c3dcd935ac5c0399',
  ])

  const secondMerge = firstMerge.merge({
    tokenUtxos: { bitcoin: UtxoCollection.fromJSON(utxosFixtureBitcoin, { currency: bitcoin }) },
  })

  expect(secondMerge.tokenUtxos.bitcoin.size).toEqual(2)
  expect(secondMerge.tokenUtxos.bitcoin.toArray().map((utxo) => utxo.txId)).toEqual([
    'AAfb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
    'BBe99b2367587e121f08e2a95150fbd0939158358181f0a6c3dcd935ac5c0399',
  ])

  // NOTE! cardano tokenUtxos is not merge due to be shallow
  expect(Object.keys(secondMerge.tokenUtxos)).toEqual(['bitcoin'])

  const thirdMerge = secondMerge.merge({
    tokenUtxos: {
      ...secondMerge.tokenUtxos, // we need to add existing tokenUtxos
      cardano: UtxoCollection.fromJSON(utxosFixture3, { currency: cardano }),
    },
  })

  expect(Object.keys(thirdMerge.tokenUtxos)).toEqual(['bitcoin', 'cardano'])
  expect(thirdMerge.tokenUtxos.cardano.size).toEqual(2)
  expect(thirdMerge.tokenUtxos.cardano.toArray().map((utxo) => utxo.txId)).toEqual([
    '17fb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
    '2de99b2367587e121f08e2a95150fbd0939158358181f0a6c3dcd935ac5c0399',
  ])
  expect(thirdMerge.tokenUtxos.bitcoin.size).toEqual(2)
  expect(thirdMerge.tokenUtxos.bitcoin.toArray().map((utxo) => utxo.txId)).toEqual([
    'AAfb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
    'BBe99b2367587e121f08e2a95150fbd0939158358181f0a6c3dcd935ac5c0399',
  ])
})
