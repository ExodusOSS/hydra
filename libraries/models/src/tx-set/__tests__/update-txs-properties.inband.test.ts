import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import { txs3 as _txs3 } from '../../tx/__tests__/fixtures/legacy/index.js'
import type { TxProps } from '../../tx/index.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import TxSet from '../index.js'

const txs = normalizeTxsJSON({ json: _txs3, assets }) as (TxProps & { txId: string })[]

const reverseString = (str: string) => [...str].reverse().join('')

test('updateTxsProperties()', (t) => {
  const set = TxSet.fromArray(txs)

  const firstTx = txs[0]!
  const updatedConfirmations = firstTx.confirmations! + 1
  t.equals(
    set
      //
      .updateTxsProperties([{ ...firstTx, confirmations: updatedConfirmations }])
      .get(firstTx.txId!)!.confirmations,
    updatedConfirmations,
    'txs are updated'
  )

  const missingTxId = reverseString(firstTx.txId!)

  t.equals(
    set.updateTxsProperties([{ ...firstTx, txId: missingTxId }]).get(missingTxId),
    undefined,
    'missing txs are ignored'
  )

  t.equals(
    set.updateTxsProperties(txs).get(firstTx.txId!),
    set.get(firstTx.txId!),
    'references preserved when there are no changes'
  )

  t.equals(
    set.updateTxsProperties(txs).equals(set),
    true,
    "equals() returns true when underlying txs haven't been updated"
  )

  t.end()
})

test('updateTxsProperties() accepts serialized TxJson items', (t) => {
  const set = TxSet.fromArray(txs)
  const firstTx = set.get(txs[0]!.txId!)!
  const txId = firstTx.txId!
  const serialized = { ...firstTx.toJSON(), txId }

  // Round-trip: feed back the JSON serialization. Should be a no-op.
  const result = set.updateTxsProperties([serialized])
  t.true(result.equals(set), 'no-op when feeding back unchanged toJSON()')

  // Mutate one field of the serialized form and feed it back.
  const updated = set.updateTxsProperties([{ ...serialized, confirmations: 999 }])
  t.equals(updated.get(txId)!.confirmations, 999, 'mutated field from serialized input is applied')

  t.end()
})
