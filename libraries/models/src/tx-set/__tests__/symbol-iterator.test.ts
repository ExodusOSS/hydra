import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import { txs1 as _txs1 } from '../../tx/__tests__/fixtures/legacy/index.js'
import Tx from '../../tx/index.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import TxSet from '../index.js'

const txs1 = normalizeTxsJSON({ json: _txs1, assets })

test('Array.from() should convert a TxSet to Array<TxSet>', (t) => {
  t.plan(2)

  const txset = TxSet.fromArray(txs1.map(Tx.fromJSON))
  const arr = [...txset]

  t.is(txset.size, arr.length, 'equal length / size')
  t.true(txset.size > 1, 'has at least 2 tx')

  t.end()
})
