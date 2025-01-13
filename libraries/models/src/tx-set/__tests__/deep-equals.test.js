import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import Tx from '../../tx/index.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import _txs from '../../tx/__tests__/fixtures/legacy/index.cjs'
import TxSet from '../index.js'

const { txs1: _txs1, txs2: _txs2 } = _txs

const txs1 = normalizeTxsJSON({ json: _txs1, assets })
const txs2 = normalizeTxsJSON({ json: _txs2, assets })

test('deepEquals() returns true if all contained txs are equal', (t) => {
  let set1 = TxSet.fromArray(txs1)
  const set2 = TxSet.fromArray(txs2)

  t.true(set1.deepEquals(set2), 'sets are deep equal')

  set1 = set1.updateTxsProperties([
    Tx.fromJSON({
      ...txs1[0],
      date: new Date(new Date(txs1[0].date).getTime() + 1).toISOString(),
    }),
  ])

  t.true(set1.equals(set2), 'sets are equal')
  t.false(set1.deepEquals(set2), 'sets are not deep equal')

  t.end()
})

test('deepEquals() test for large sets', (t) => {
  const length = 2000
  const listTxs1 = []
  const listTxs2 = []

  for (let i = 0; i < length; i++) {
    listTxs1.push({
      ...txs1[0],
      txId: `txID_0000000001_${i}`,
      confirmations: 1,
    })
    listTxs2.push({
      ...txs1[0],
      txId: `txID_0000000001_${i}`,
      confirmations: 1,
    })
  }

  let set1 = TxSet.fromArray(listTxs1)
  const set2 = TxSet.fromArray(listTxs2)

  t.true(set1.deepEquals(set2), 'sets are deep equal')

  set1 = set1.updateTxsProperties([
    Tx.fromJSON({
      ...listTxs1[length - 2],
      confirmations: 0,
    }),
  ])

  t.true(set1.equals(set2), 'sets are equal')
  t.false(set1.deepEquals(set2), 'sets are not deep equal')

  t.end()
})
