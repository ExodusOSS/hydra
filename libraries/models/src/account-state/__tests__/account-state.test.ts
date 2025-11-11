import { isNumberUnit } from '@exodus/currency'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

import {
  bittorrent,
  cardano,
  tetherusdtron,
  tronmainnet,
} from '../../__tests__/_fixtures-currencies.js'
import UtxoCollection from '../../utxo-collection/index.js'
import AccountState from '../index.js'
import { fixture1, utxosFixture1, utxosFixture2 } from './fixtures.js'

const { cloneDeep } = lodash

export class HelloAccountState extends AccountState {
  static defaults = {
    trx: tronmainnet.parse('0 TRX'),
    btt: bittorrent.parse('0 BTT'),
    usdt: tetherusdtron.parse('0 USDTTRX'),
    tokenBalances: {},
    listOfStuff: ['foo', 'bar', 'buzz'],
    utxos: UtxoCollection.fromJSON(utxosFixture1, { currency: cardano }),
    buffer: Buffer.from([1, 2, 3, 4]),
    cursor: 0,
  }
}

class ByeAccountState extends AccountState {
  static defaults = {
    balance: cardano.parse('0 ADA'),
    tokenBalances: {},
  }
}

test('is instance', () => {
  const as1 = HelloAccountState.create()
  const as2 = HelloAccountState.create({ trx: tronmainnet.defaultUnit(1) })
  const as3 = ByeAccountState.create()

  expect(as1 instanceof AccountState).toBe(true)
  expect(as2 instanceof AccountState).toBe(true)
  expect(as3 instanceof AccountState).toBe(true)
  expect(as1 instanceof HelloAccountState).toBe(true)
  expect(as2 instanceof HelloAccountState).toBe(true)
  expect(as3 instanceof HelloAccountState).toBe(false)
  expect(as1 instanceof ByeAccountState).toBe(false)
  expect(as2 instanceof ByeAccountState).toBe(false)
  expect(as3 instanceof ByeAccountState).toBe(true)
})

test('create with empty data', () => {
  const result = HelloAccountState.create()
  expect(isNumberUnit(result.trx)).toBeTruthy()
  expect(result.trx.toString()).toEqual('0 TRX')
  expect(isNumberUnit(result.btt)).toBeTruthy()
  expect(result.btt.toString()).toEqual('0 BTT')
  expect(result.usdt.toString()).toEqual('0 USDTTRX')
})

test('create with some data', () => {
  const result = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
    keyNotInDefaults: 1,
  })
  expect(result.trx.toString()).toEqual('1 TRX')
  expect(result.keyNotInDefaults).toBeUndefined()
  expect(result.cursor).toEqual(0)
})

test('toJSON', () => {
  const result = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
    cursor: 1,
  }).toJSON()
  expect(result).toEqual(fixture1)
})

test('toRedactedJSON', () => {
  const result = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
    cursor: 1,
  }).toRedactedJSON()

  expect(result).toEqual({
    _version: 1,
    btt: '0 BTT',
    cursor: 1,
    tokenBalances: {},
    trx: '1 TRX',
    usdt: '0 USDTTRX',
  })
})

test('serialize', () => {
  const accountState = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
    cursor: 1,
  })
  const result = HelloAccountState.serialize(accountState)
  expect(result).toEqual(fixture1)
})

test('deserialize', () => {
  const accountState = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
    cursor: 1,
  })
  const serialized = HelloAccountState.serialize(accountState)
  const result = HelloAccountState.deserialize(serialized)
  expect(result instanceof HelloAccountState).toBeTruthy()
  expect(accountState.equals(result)).toBeTruthy()
})

test('merge', () => {
  const accountState1 = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
  })
  const accountState2 = accountState1.merge({
    cursor: 1,
  })
  expect(accountState1).not.toBe(accountState2)
  expect(accountState2.toJSON()).toEqual(fixture1)
})

test('equals success', () => {
  const now = new Date()
  const accountState1 = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
    utxos: UtxoCollection.fromJSON(utxosFixture2, { currency: cardano }),
    tokenBalances: { btt: bittorrent.parse('123000 BTT'), foo: 'abc' },
    cursor: 1,
    date: now,
  })
  const accountState2 = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
    utxos: UtxoCollection.fromJSON(utxosFixture2, { currency: cardano }),
    tokenBalances: { btt: bittorrent.parse('123000 BTT'), foo: 'abc' },
    cursor: 1,
    date: now,
  })
  expect(accountState1.equals(accountState2)).toBeTruthy()
})

test('equals fail NumberUnit', () => {
  const accountState1 = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(2),
  })
  const accountState2 = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
  })
  expect(accountState1.equals(accountState2)).toBeFalsy()
})

test('equals fail UtxoCollection', () => {
  const accountState1 = HelloAccountState.create({
    utxos: UtxoCollection.fromJSON(utxosFixture1, { currency: cardano }),
  })
  const fixture = cloneDeep(utxosFixture1)
  fixture[Object.keys(fixture)[0] as keyof typeof fixture].path = 'm/0/1'
  const accountState2 = HelloAccountState.create({
    utxos: UtxoCollection.fromJSON(fixture, { currency: cardano }),
  })
  expect(accountState1.equals(accountState2)).toBeFalsy()
})

test('equals fail object', () => {
  const accountState1 = HelloAccountState.create({
    tokenBalances: { foo: 'abc', bar: 'cba' },
  })
  const accountState2 = HelloAccountState.create({
    tokenBalances: { foo: 'abc', bar: 'fgh' },
  })
  expect(accountState1.equals(accountState2)).toBeFalsy()
})

test('equals fail array', () => {
  const accountState1 = HelloAccountState.create({
    listOfStuff: [1, 2, 3],
  })
  const accountState2 = HelloAccountState.create({
    listOfStuff: [1, 2, 4],
  })
  expect(accountState1.equals(accountState2)).toBeFalsy()
})

test('equals fail integer', () => {
  const accountState1 = HelloAccountState.create({
    cursor: 1,
  })
  const accountState2 = HelloAccountState.create({
    cursor: 2,
  })
  expect(accountState1.equals(accountState2)).toBeFalsy()
})

test('equals fail date', () => {
  const accountState1 = HelloAccountState.create({
    cursor: new Date(),
  })
  const accountState2 = HelloAccountState.create({
    cursor: new Date(42),
  })
  expect(accountState1.equals(accountState2)).toBeFalsy()
})

test('contains', () => {
  const accountState1 = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
  })
  const newData = { trx: tronmainnet.defaultUnit(1) }
  expect(accountState1.contains(newData)).toBeTruthy()
})

test('contains fail', () => {
  const accountState1 = HelloAccountState.create()
  const newData = { trx: tronmainnet.defaultUnit(1) }
  expect(accountState1.contains(newData)).toBeFalsy()
})

test('cannot create AccountState instance', () => {
  const fn1 = () => new AccountState({})
  const fn2 = () => AccountState.create()
  const fn3 = () => AccountState.deserialize({})
  const fn4 = () => AccountState.fromJSON({})

  const message =
    'Instantiating the base AccountState class is forbidden, please instantiate a subclass instance'
  expect(fn1).toThrow(message)
  expect(fn2).toThrow(message)
  expect(fn3).toThrow(message)
  expect(fn4).toThrow(message)
})
