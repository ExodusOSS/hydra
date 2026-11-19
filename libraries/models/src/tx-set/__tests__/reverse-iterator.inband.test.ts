import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import { txs1 as _txs1 } from '../../tx/__tests__/fixtures/legacy/index.js'
import Tx from '../../tx/index.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import TxSet from '../index.js'

const txs1 = normalizeTxsJSON({ json: _txs1, assets })

test('reverse() should return a reversed iterator of TxSet', (t) => {
  t.plan(2)

  const txset = TxSet.fromArray(txs1.map(Tx.fromJSON))
  const reversedTxset = txset.reverse()

  t.same([...reversedTxset], [...txset].reverse(), 'reversed txs')

  t.end()
})
