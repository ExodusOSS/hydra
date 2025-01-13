import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import { normalizeTxsJSON } from '../utils.js'
import Tx from '../index.js'
import _txs from './fixtures/legacy/index.cjs'

const { txs1: _txsA } = _txs

const txsA = normalizeTxsJSON({ json: _txsA, assets })

test('clone() should clone TX', (t) => {
  t.plan(1)

  const tx1 = Tx.fromJSON(txsA[0])
  const tx2 = tx1.clone()

  t.true(tx1.equals(tx2), 'cloned TX are equal')

  t.end()
})
