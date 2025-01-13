import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import _txs from '../../tx/__tests__/fixtures/legacy/index.cjs'
import TxSet from '../index.js'

const { txs3: _txs3 } = _txs

const txs = normalizeTxsJSON({ json: _txs3, assets })

const reverseString = (str) => [...str].reverse().join('')

test('updateTxsProperties()', (t) => {
  const set = TxSet.fromArray(txs)

  const firstTx = txs[0]
  const updatedConfirmations = firstTx.confirmations + 1
  t.equals(
    set
      //
      .updateTxsProperties([{ ...firstTx, confirmations: updatedConfirmations }])
      .get(firstTx.txId).confirmations,
    updatedConfirmations,
    'txs are updated'
  )

  const missingTxId = reverseString(firstTx.txId)

  t.equals(
    set.updateTxsProperties([{ ...firstTx, txId: missingTxId }]).get(missingTxId),
    undefined,
    'missing txs are ignored'
  )

  t.equals(
    set.updateTxsProperties(txs).get(firstTx.txId),
    set.get(firstTx.txId),
    'references preserved when there are no changes'
  )

  t.equals(
    set.updateTxsProperties(txs).equals(set),
    true,
    "equals() returns true when underlying txs haven't been updated"
  )

  t.end()
})
