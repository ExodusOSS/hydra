// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import { txs1 as _txs1 } from '../../tx/__tests__/fixtures/legacy/index.js'
import type Tx from '../../tx/index.js'
import type { TxProps } from '../../tx/index.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import TxSet from '../index.js'

const { shuffle } = lodash

const txs1 = normalizeTxsJSON({ json: _txs1, assets })

test('sortByAsc() should sort by ASC', (t) => {
  function check(txs: TxProps[] | Tx[]) {
    t.is(txs[0]!.txId, '4df2293c3d59fddc4908e655ecdea0031bb5b51455de30d93604bf86d6d8316d', '1')
    t.is(txs[1]!.txId, 'bd1e58968997fadf2a8b47af1f0105067aa02153352d1df25061cf30c311aeeb', '2')
    t.is(txs[2]!.txId, 'e7e699ce958c603b368807f4095f4f5b409e9c2b1139109ec997e1c6da5c6769', '3')
    t.is(txs[3]!.txId, '90666373b49cb838b336b9c25e3d0e0c7b8fff1bcabcd173b3115bd0b24de247', '4')
  }

  // before shuffle
  check(txs1)
  // we do this to convert each item to a Tx object
  const txs = [...TxSet.fromArray(txs1)]

  const txRes1 = TxSet.util.sortByAsc([...shuffle(txs)])
  check(txRes1)
  const txRes2 = TxSet.util.sortByAsc(TxSet.fromArray(shuffle(txs)))
  check(txRes2)

  t.end()
})

test('sortByDesc() should sort by DESC', (t) => {
  function check(txs: TxProps[] | Tx[]) {
    t.is(txs[3]!.txId, '4df2293c3d59fddc4908e655ecdea0031bb5b51455de30d93604bf86d6d8316d', '1')
    t.is(txs[2]!.txId, 'bd1e58968997fadf2a8b47af1f0105067aa02153352d1df25061cf30c311aeeb', '2')
    t.is(txs[1]!.txId, 'e7e699ce958c603b368807f4095f4f5b409e9c2b1139109ec997e1c6da5c6769', '3')
    t.is(txs[0]!.txId, '90666373b49cb838b336b9c25e3d0e0c7b8fff1bcabcd173b3115bd0b24de247', '4')
  }

  // we do this to convert each item to a Tx object
  const txs = [...TxSet.fromArray(txs1)]

  const txRes1 = TxSet.util.sortByDesc([...shuffle(txs)])
  check(txRes1)
  const txRes2 = TxSet.util.sortByDesc(TxSet.fromArray(shuffle(txs)))
  check(txRes2)

  t.end()
})
