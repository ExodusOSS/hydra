import {
  bittorrent,
  cardano,
  tetherusdtron,
  tronmainnet,
} from '../../__tests__/_fixtures-currencies.js'
import { UtxoCollection } from '../../index.js'
import AccountState from '../index.js'
import { fixture1, utxosFixture1 } from './fixtures.js'

export class HelloAccountState extends AccountState {
  static defaults = {
    trx: tronmainnet.parse('0 TRX'),
    btt: bittorrent.parse('0 BTT'),
    usdt: tetherusdtron.parse('0 USDTTRX'),
    tokenBalances: {},
    listOfStuff: ['foo', 'bar', 'buzz'],
    utxos: UtxoCollection.fromJSON(utxosFixture1, { currency: cardano }),
    cursor: 0,
    buffer: Buffer.from([1, 2, 3, 4]),
  }
}

test('serialize accountState', () => {
  const accountState = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
    cursor: 1,
  })
  const serialized = HelloAccountState.serialize(accountState)
  // console.log(JSON.stringify(serialized, null, 2))
  expect(serialized).toEqual(fixture1)
})

test('serialize accountState with toJSON', () => {
  const accountState = HelloAccountState.create({
    trx: tronmainnet.defaultUnit(1),
    cursor: 1,
  })
  const serialized = accountState.toJSON()
  // console.log(JSON.stringify(serialized, null, 2))
  expect(serialized).toEqual(fixture1)
})

test('deserialize accountState', () => {
  const accountState = HelloAccountState.create()
  const serialized = HelloAccountState.serialize(accountState)
  const result = HelloAccountState.deserialize(serialized)
  // console.log(result)
  expect(result.trx.unitType.equals(accountState.trx.unitType)).toBeTruthy()
  expect(result.usdt.unitType.equals(accountState.usdt.unitType)).toBeTruthy()
  expect(result.trx.toString()).toEqual(accountState.trx.toString())
  expect(result.usdt.toString()).toEqual(accountState.usdt.toString())
  expect(result.buffer.toString('hex')).toEqual(accountState.buffer.toString('hex'))
  expect(result.buffer.length).toEqual(4)
  for (const assetName of Object.keys(accountState.tokenBalances)) {
    expect(
      result.tokenBalances[assetName].unitType.equals(
        accountState.tokenBalances[assetName].unitType
      )
    ).toBeTruthy()
    expect(result.tokenBalances[assetName].toString()).toEqual(
      accountState.tokenBalances[assetName].toString()
    )
  }
})
