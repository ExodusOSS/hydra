import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import _txs from '../../tx/__tests__/fixtures/legacy/index.cjs'
import TxSet from '../index.js'

const { txs1: _txs1 } = _txs

const txs1 = normalizeTxsJSON({ json: _txs1, assets })

test('getAt() should return Tx from its order', (t) => {
  const txset = TxSet.fromArray(txs1)

  t.is(txset.size, 4, 'has 4')
  t.is(
    txset.getAt(0).txId,
    '4df2293c3d59fddc4908e655ecdea0031bb5b51455de30d93604bf86d6d8316d',
    'tx from 0'
  )
  t.is(
    txset.getAt(1).txId,
    'bd1e58968997fadf2a8b47af1f0105067aa02153352d1df25061cf30c311aeeb',
    'tx from 1'
  )
  t.is(
    txset.getAt(2).txId,
    'e7e699ce958c603b368807f4095f4f5b409e9c2b1139109ec997e1c6da5c6769',
    'tx from 2'
  )
  t.is(
    txset.getAt(3).txId,
    '90666373b49cb838b336b9c25e3d0e0c7b8fff1bcabcd173b3115bd0b24de247',
    'tx from 3'
  )

  t.end()
})

test('getAt() should return undefined outside its limits', (t) => {
  const txset = TxSet.fromArray(txs1)

  t.is(txset.size, 4, 'has 4')
  t.is(txset.getAt(4), undefined, 'index too large')

  // consider going backwards?
  t.is(txset.getAt(-1), undefined, 'index too small')

  t.end()
})
