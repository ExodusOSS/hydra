import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import Tx from '../index.js'
import { normalizeTxJSON } from '../utils.js'
import { tx as _tx1, tx2 as _tx2 } from './fixtures/index.js'

const tx1 = normalizeTxJSON({ json: _tx1, asset: assets[_tx1.coinName] })
const tx2 = normalizeTxJSON({ json: _tx2, asset: assets[_tx1.coinName] })

test('equals() should work', (t) => {
  const a1 = Tx.fromJSON(tx1)
  const a2 = Tx.fromJSON(tx1)
  const b = Tx.fromJSON(tx2)

  t.equals(a1.equals(a2), true, 'equals() returns true for equal txs')
  t.equals(b.equals(a1), false, 'equals() returns false for non-equal txs')

  t.end()
})
