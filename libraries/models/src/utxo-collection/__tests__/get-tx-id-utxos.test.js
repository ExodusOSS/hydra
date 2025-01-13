import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import * as fixtures from './fixtures/index.cjs'

test('get utxos associated with tx id', function (t) {
  const utxos = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })
  const txIds = utxos.txIds

  t.is(txIds.length, 3)

  const utxosWithTxId0 = utxos.getTxIdUtxos(txIds[0])
  t.is(utxosWithTxId0.txIds.length, 1, 'should always only have 1')
  t.is(utxosWithTxId0.txIds[0], txIds[0], 'verify txid is the same')
  t.is(utxosWithTxId0.addresses.size, 2, 'in this case, matched 2 addresses')
  t.is(utxosWithTxId0.value.toString(), '4 BTC', 'total value')
  t.is(utxosWithTxId0.toArray().length, 2, 'total utxos')

  const utxosWithTxId1 = utxos.getTxIdUtxos(txIds[1])
  t.is(utxosWithTxId1.txIds.length, 1)
  t.is(utxosWithTxId1.txIds[0], txIds[1])
  t.is(utxosWithTxId1.addresses.size, 2)
  t.is(utxosWithTxId1.value.toString(), '6 BTC')
  t.is(utxosWithTxId1.toArray().length, 2)

  const utxosWithTxId2 = utxos.getTxIdUtxos(txIds[2])
  t.is(utxosWithTxId2.txIds.length, 1)
  t.is(utxosWithTxId2.txIds[0], txIds[2])
  t.is(utxosWithTxId2.addresses.size, 1)
  t.is(utxosWithTxId2.value.toString(), '5 BTC')
  t.is(utxosWithTxId2.toArray().length, 1)

  t.end()
})
