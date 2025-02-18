import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import Tx from '../index.js'
import { normalizeTxsJSON } from '../utils.js'
import { txs1 as _txsA } from './fixtures/legacy/index.js'

const txsA = normalizeTxsJSON({ json: _txsA, assets })

test('clone() should clone TX', (t) => {
  t.plan(1)

  const tx1 = Tx.fromJSON(txsA[0]!)
  const tx2 = tx1.clone()

  t.true(tx1.equals(tx2), 'cloned TX are equal')

  t.end()
})
