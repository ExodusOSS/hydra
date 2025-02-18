import assert from 'assert'

import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import { txs3 as _txs3 } from '../../tx/__tests__/fixtures/legacy/index.js'
import Tx from '../../tx/index.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import TxSet from '../index.js'

const txs = normalizeTxsJSON({ json: _txs3, assets })

test('toJSON() should convert TxSet to JSON represenation', (t) => {
  assert.deepStrictEqual(
    TxSet.fromArray(txs).toJSON(),
    txs.map(Tx.fromJSON).map((tx) => tx.toJSON()),
    'json is the same'
  )

  t.end()
})
