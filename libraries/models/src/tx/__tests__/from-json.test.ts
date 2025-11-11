import { connectAssets } from '@exodus/assets'
import assert from 'assert'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import Tx from '../index.js'
import { normalizeTxsJSON } from '../utils.js'
import { txs1 as _txsA, txs2 as _txsB, txs3 as _txsC } from './fixtures/legacy/index.js'
import { customAssets, customAssetTxJson1 } from './fixtures/tx-custom-assets.js'

const { cloneDeep: clone } = lodash

const txsA = normalizeTxsJSON({ json: _txsA, assets })
const txsB = normalizeTxsJSON({ json: _txsB, assets })
const txsC = normalizeTxsJSON({ json: _txsC, assets })

test('should read JSON receive', (t) => {
  const txsCA = txsA.map(Tx.fromJSON)
  const txsCB = txsB.map(Tx.fromJSON)

  t.is(txsCA.length, txsCB.length, 'verify lengths are the same')
  t.true(txsCA.length > 0, 'has at least one tx')
  t.true(
    txsCA.every((tx, i) => tx.equals(txsCB[i])),
    'every TX equals the other'
  )

  const actual = txsCA[1].toJSON()
  const expected = {
    txId: 'bd1e58968997fadf2a8b47af1f0105067aa02153352d1df25061cf30c311aeeb',
    confirmations: 0,
    coinAmount: '-0.05 BTC',
    date: '2016-11-29T04:56:26.200Z',
    coinName: 'bitcoin',
    currencies: { bitcoin: { BTC: 8, bits: 2, satoshis: 0 } },
    version: 1,
  }

  assert.deepEqual(actual, expected, 'toJSON() equivalence ')

  t.end()
})

test('fromJSON() should be idempotent', (t) => {
  const tx1 = Tx.fromJSON(txsA[0]!)
  const tx2 = Tx.fromJSON(tx1)

  t.true(tx1.equals(tx2), 'idempotency on fromJSON()')

  t.end()
})

test('fromJSON() should parse feeAmount', (t) => {
  const tx = Tx.fromJSON(txsC[0]!)
  t.is(tx.feeAmount.toString(), '0.0002034 BTC', 'has fee amount')

  t.end()
})

test('fromJSON() from should be an empty array by default', (t) => {
  const tx = Tx.fromJSON(txsC[4]!)
  t.same(tx.from, [], 'from is an empty array')

  t.end()
})

test('fromJSON() should parse from', (t) => {
  const tx = Tx.fromJSON(txsC[5]!)
  t.same(tx.from, ['xrb_1jf76jbbmz8swncquc918gbe4csw8mx59kuayckg96d6wwepbjnnoq1pujci'], 'has from')

  t.end()
})

test('fromJSON() should throw if from is not an array', (t) => {
  const jsonTx = clone(txsC[5])!
  // @ts-expect-error -- invalid type
  jsonTx.from = 'xrb_1jf76jbbmz8swncquc918gbe4csw8mx59kuayckg96d6wwepbjnnoq1pujci'

  t.throws(() => Tx.fromJSON(jsonTx), Error, 'should throw')

  t.end()
})

test('fromJSON() should parse selfSend', (t) => {
  const tx = Tx.fromJSON(txsC[6]!)
  t.same(tx.selfSend, true, 'selfSend is true')

  t.end()
})

describe('fromJSON() using custom assets', () => {
  const assets = connectAssets(customAssets)
  const txJson = customAssetTxJson1

  test('fromJSON() should parse json', (t) => {
    const tx = Tx.fromJSON(txJson)
    expect(tx).toBeDefined()
    expect(tx.coinAmount.equals(assets.mytoken.currency.defaultUnit('0.001'))).toBe(true)
    expect(tx.feeAmount.equals(assets.myfeetoken.currency.defaultUnit('0.003'))).toBe(true)
    t.end()
  })

  test('clone should work using custom assets', (t) => {
    const original = Tx.fromJSON(txJson)
    const tx = original.clone()
    expect(tx).toBeDefined()
    expect(tx.coinAmount.equals(assets.mytoken.currency.defaultUnit('0.001'))).toBe(true)
    expect(tx.feeAmount.equals(assets.myfeetoken.currency.defaultUnit('0.003'))).toBe(true)
    t.end()
  })

  test('toJSON returns same objects when using custom assets', (t) => {
    const original = Tx.fromJSON(txJson)
    const toJson = original.toJSON()
    expect(txJson).toEqual(toJson)
    t.end()
  })

  // Re-enable once currencies object is provided or stored.
  test.skip('update should work using custom assets', (t) => {
    const original = Tx.fromJSON(txJson)
    const tx = original.update({
      data: { newField: 'my value' },
      date: '2017-11-29T05:13:59.697Z',
      feeAmount: '0.005 MYFEETOKEN',
    })
    expect(tx.data.newField).toBe('my value')
    expect(tx).toBeDefined()
    expect(tx.coinAmount.equals(assets.mytoken.currency.defaultUnit('0.001'))).toBe(true)
    expect(tx.feeAmount.equals(assets.myfeetoken.currency.defaultUnit('0.005'))).toBe(true)
    t.end()
  })
})
