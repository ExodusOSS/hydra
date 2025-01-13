import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import _txs from '../../tx/__tests__/fixtures/legacy/index.cjs'
import TxSet from '../index.js'

const { txs1: _txs1, txs2: _txs2 } = _txs

const txs1 = normalizeTxsJSON({ json: _txs1, assets })
const txs2 = normalizeTxsJSON({ json: _txs2, assets })

test('union() with set equivalence should return same set', (t) => {
  const tx1 = TxSet.fromArray(txs1)
  const tx2 = TxSet.fromArray(txs2)

  t.true(tx1.equals(tx2), 'same set')

  const tx3 = tx1.union(tx2)
  t.true(tx3.equals(tx1), 'same set after union')

  t.end()
})

test('union() should return set union of two sets', (t) => {
  const tx1 = TxSet.fromArray(txs1)
  const tx1a = TxSet.fromArray([tx1.getAt(0), tx1.getAt(1)])
  const tx1b = TxSet.fromArray([tx1.getAt(2), tx1.getAt(3)])

  const tx2 = tx1a.union(tx1b)
  t.true(tx1.equals(tx2), 'equals after union()')

  t.deepEqual(tx1, tx2, 'sets are the same after union()')

  t.end()
})
