import { connectAssets } from '@exodus/assets'
import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import Tx from '../../tx/index.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import { customAssets, customAssetTxJson1 } from '../../tx/__tests__/fixtures/tx-custom-assets.js'
import _txs from '../../tx/__tests__/fixtures/legacy/index.cjs'
import TxSet from '../index.js'
import fixtures from './fixtures/index.cjs'

const { txs1: _txs1 } = _txs
const { sameDate: _sameDateTxs } = fixtures

const txs1 = normalizeTxsJSON({ json: _txs1, assets })
const sameDateTxs = normalizeTxsJSON({ json: _sameDateTxs, assets })

test('fromArray() should convert an array of TX objects to a TxSet', (t) => {
  t.plan(2)

  const txsConv = txs1.map(Tx.fromJSON)
  const txset = TxSet.fromArray(txsConv)

  t.is(txset.size, txsConv.length, 'equal length / size')
  t.true(txset.size > 1, 'has at least 1 tx')

  t.end()
})

test('fromArray() should convert an array of TX JSON objects to a TxSet', (t) => {
  t.plan(2)

  const txset = TxSet.fromArray(txs1)

  t.is(txset.size, txs1.length, 'equal length / size')
  t.true(txset.size > 1, 'has at least 1 tx')

  t.end()
})

test('fromArray() should have deterministic sort when two txs have the same date', (t) => {
  t.plan(1)

  const txset1 = TxSet.fromArray(sameDateTxs)
  const txset2 = TxSet.fromArray(sameDateTxs.reverse())

  t.deepEquals(txset1.toJSON(), txset2.toJSON())

  t.end()
})

// TODO: reconsider this behavior
test('fromArray() should convert undefined / null / non-array value', (t) => {
  const setUndef = TxSet.fromArray()
  const setNull = TxSet.fromArray(null)
  const setNonArray = TxSet.fromArray('')

  t.is(setUndef.size, 0, '0 txs')
  t.is(setNull.size, 0, '0 txs')
  t.is(setNonArray.size, 0, '0 txs')

  t.deepEquals(setUndef, setNull, 'null is undefined set')
  t.deepEquals(TxSet.EMPTY, setUndef, 'same as EMPTY')
  t.deepEquals(TxSet.EMPTY, setNonArray, 'same as EMPTY')

  t.end()
})

describe('fromArray() using custom assets', () => {
  const assets = connectAssets(customAssets)
  const txJson = customAssetTxJson1

  test('fromArray() should parse txs array', (t) => {
    const txset = TxSet.fromArray([txJson])
    t.is(txset.size, 1, 'equal length / size')
    const tx = txset.get(txJson.txId)
    expect(tx).toBeDefined()
    expect(tx.coinAmount.equals(assets.mytoken.currency.defaultUnit('0.001'))).toBe(true)
    expect(tx.feeAmount.equals(assets.myfeetoken.currency.defaultUnit('0.003'))).toBe(true)
    t.end()
  })

  test('update should work using custom assets', (t) => {
    const txset = TxSet.fromArray([txJson]).update([
      {
        txId: txJson.txId,
        data: { newField: 'my value' },
        date: '2017-11-29T05:13:59.697Z',
        feeAmount: '0.005 MYFEETOKEN',
      },
    ])
    const tx = txset.get(txJson.txId)
    expect(tx).toBeDefined()
    expect(tx.data.newField).toBe('my value')
    expect(tx.coinAmount.equals(assets.mytoken.currency.defaultUnit('0.001'))).toBe(true)
    expect(tx.feeAmount.equals(assets.myfeetoken.currency.defaultUnit('0.005'))).toBe(true)
    t.end()
  })
})
