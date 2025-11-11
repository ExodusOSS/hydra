import type NumberUnit from '@exodus/currency'
import { isNumberUnit } from '@exodus/currency'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

import { assets } from '../../__tests__/_fixtures-assets.js'
import { bittorrent, tetherusdtron, tronmainnet } from '../../__tests__/_fixtures-currencies.js'
import AccountState from '../index.js'
import { legacyFixture1, legacyFixture1Serialized } from './fixtures.js'

const { isString, isEqual, reduce } = lodash

const parseBalance = (balance: string | NumberUnit, assetName: string) =>
  !isNumberUnit(balance) && isString(balance) ? assets[assetName].currency.parse(balance) : balance

export class HelloAccountStateLegacy extends AccountState {
  static defaults = {
    trx: tronmainnet.parse('0 TRX'),
    btt: bittorrent.parse('0 BTT'),
    usdt: tetherusdtron.parse('0 USDTTRX'),
    tokenBalances: { bittorrent: bittorrent.parse('0 BTT') },
    cursor: 1,
    date: null,
    empty: null,
  }

  static _tokens = [assets.tronmainnet, assets.bittorrent, assets.tetherusdtron]
  static _dateKeys = ['date', 'empty']

  static _postParse(data: Record<string, any>) {
    return {
      ...data,
      tokenBalances: reduce(
        data.tokenBalances,
        (r, tokenBalance, assetName) =>
          assets[assetName]
            ? Object.assign(r, { [assetName]: parseBalance(tokenBalance, assetName) })
            : r,
        {}
      ),
    }
  }
}

test('deserialize', () => {
  const accountState = HelloAccountStateLegacy.create({
    btt: bittorrent.parse('10 BTT'),
    date: new Date('2009-01-03'),
  })
  const result = HelloAccountStateLegacy.deserialize(legacyFixture1)
  expect(result instanceof HelloAccountStateLegacy).toBeTruthy()
  // console.log(result)
  expect(accountState.equals(result)).toBeTruthy()
})

test('serialize', () => {
  const accountState = HelloAccountStateLegacy.deserialize(legacyFixture1)
  const serialized = HelloAccountStateLegacy.serialize(accountState)
  expect(isEqual(serialized, legacyFixture1Serialized)).toBeTruthy()
})

test('toJSON', () => {
  const accountState = HelloAccountStateLegacy.deserialize(legacyFixture1)
  const serialized = accountState.toJSON()
  expect(isEqual(serialized, legacyFixture1Serialized)).toBeTruthy()
})
