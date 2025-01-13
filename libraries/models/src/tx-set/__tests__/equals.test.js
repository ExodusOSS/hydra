import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import Tx from '../../tx/index.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import _txs from '../../tx/__tests__/fixtures/legacy/index.cjs'
import TxSet from '../index.js'

const { txs1: _txs1, txs2: _txs2 } = _txs

const txs1 = normalizeTxsJSON({ json: _txs1, assets })
const txs2 = normalizeTxsJSON({ json: _txs2, assets })

test('equals() returns true if the tx ids are the same', (t) => {
  let set1 = TxSet.fromArray(txs1)
  let set2 = TxSet.fromArray(txs2)

  t.true(set1.equals(set2), 'sets are equal')

  set1 = set1.add(
    Tx.fromJSON({
      txId: 'deadbeef',
      date: '2014-10-1',
      currencies: { foo: { base: 0 } },
    })
  )

  set2 = set2.add(
    Tx.fromJSON({
      txId: 'deadbeef',
      date: '2000-10-01',
      currencies: { foo: { base: 0 } },
    })
  )

  t.true(set1.equals(set2), 'sets are equal')

  t.false(set1.equals(TxSet.EMPTY), 'not equal to empty set')

  t.end()
})
