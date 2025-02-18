import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import * as fixtures from './fixtures/index.js'

test('updateConfirmations()', function (t) {
  const txId = '6bd212961be413c851207e327c04ed9bd92fc5aa0194e968da3c40c8316d3f24'
  const otherId = '17abd6c7481efe452f92ff5d55bb638bba9c0c1edc61703c7a7b3ecdf5b1f639'

  let utxos = UtxoCollection.fromJSON(fixtures.fixture7, { currency: assets.bitcoin.currency })

  t.assert(
    utxos
      .getTxIdUtxos(txId)
      .toArray()
      .every((utxo) => utxo.confirmations === 0),
    'confirmations are zero at first'
  )

  const otherUtxos = utxos.getTxIdUtxos(otherId)

  // This is a bare-bones tx for this test, actual txs have more properties
  const updatedTx = {
    txId,
    confirmations: 1,
  }
  utxos = utxos.updateConfirmations([updatedTx as never])

  t.assert(
    utxos
      .getTxIdUtxos(txId)
      .toArray()
      .every((utxo) => utxo.confirmations === 1),
    'confirmations are updated'
  )
  t.assert(otherUtxos.equals(utxos.getTxIdUtxos(otherId)), 'other utxos are unchanged')

  t.end()
})

test('updateConfirmations() does nothing when confirmations are the same', function (t) {
  const txId = '6bd212961be413c851207e327c04ed9bd92fc5aa0194e968da3c40c8316d3f24'
  const utxos = UtxoCollection.fromJSON(fixtures.fixture7, { currency: assets.bitcoin.currency })

  // This is a bare-bones tx for this test, actual txs have more properties
  const updatedTx = {
    txId,
    confirmations: 0,
  }

  t.assert(utxos.equals(utxos.updateConfirmations([updatedTx as never])), 'unchanged')

  t.end()
})
