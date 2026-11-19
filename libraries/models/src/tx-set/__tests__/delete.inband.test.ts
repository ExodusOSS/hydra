import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import { txs1 as _txs1 } from '../../tx/__tests__/fixtures/legacy/index.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import TxSet from '../index.js'

const txs1 = normalizeTxsJSON({ json: _txs1, assets })

describe('TxSet.delete', () => {
  test('delete() should not delete a non existing tx', (t) => {
    const txSet1 = TxSet.fromArray(txs1)
    const txSetA = txSet1.delete('dummy')
    t.deepEqual(txSet1, txSetA, 'sets are the same after no-op delete')
    t.equals(txSet1.size, 4)
    t.equals(txSetA.size, 4)
    t.end()
  })

  test('delete() should delete existing tx by id', (t) => {
    const txSet1 = TxSet.fromArray(txs1)
    const txToDelete = txSet1.getAt(2)!
    const txSetA = txSet1.delete(txToDelete.txId!)
    const txs1WithoutTx = TxSet.fromArray(txs1.filter((tx) => tx.txId !== txToDelete.txId))
    t.deepEqual(txSetA, txs1WithoutTx, 'sets removes index 2 by txId')
    t.equals(txSet1.size, 4)
    t.equals(txSetA.size, 3)
    t.end()
  })

  test('delete() should delete existing tx by object', (t) => {
    const txSet1 = TxSet.fromArray(txs1)
    const txToDelete = txSet1.getAt(2)!
    const txSetA = txSet1.delete(txToDelete)
    const txs1WithoutTx = TxSet.fromArray(txs1.filter((tx) => tx.txId !== txToDelete.txId))
    t.deepEqual(txSetA, txs1WithoutTx, 'sets removes index 2 by object')
    t.equals(txSet1.size, 4)
    t.equals(txSetA.size, 3)
    t.end()
  })
})
