import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import * as fixtures from './fixtures/index.js'

test('difference address utxos', function (t) {
  t.plan(2)

  const utxos1 = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })
  const utxos4 = UtxoCollection.fromJSON(fixtures.fixture4, { currency: assets.bitcoin.currency })
  const utxos5 = UtxoCollection.fromJSON(fixtures.fixture5, { currency: assets.bitcoin.currency })

  const newUtxos = utxos1.difference(utxos4)
  t.true(newUtxos.equals(utxos5), 'difference verified')

  const zeroUtxos = utxos4.difference(utxos1)
  const utxosEmpty = UtxoCollection.fromArray([], { currency: assets.bitcoin.currency })
  t.true(zeroUtxos.equals(utxosEmpty), 'no utxos')

  t.end()
})

test('difference from empty UTXO set', (t) => {
  t.plan(1)

  const utxos1 = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })
  const utxosEmpty = UtxoCollection.fromArray([], { currency: assets.bitcoin.currency })
  const newUtxos = utxos1.difference(utxosEmpty)

  t.true(utxos1.equals(newUtxos), 'difference an empty, should be the same')

  t.end()
})
