import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import * as fixtures from './fixtures/index.js'

test('are utxos equal', function (t) {
  // t.plan(10)

  const utxos1 = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })
  const utxos2 = UtxoCollection.fromJSON(fixtures.fixture2, { currency: assets.bitcoin.currency })
  const utxos3 = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })

  t.true(utxos1.equals(utxos3))
  t.true(utxos3.equals(utxos1))
  t.false(utxos1.equals(utxos2))
  t.false(utxos2.equals(utxos1))

  // possibly add method concat?
  // let utxos4 = UtxoCollection.fromJSON(fixtures.fixture4, { coin: 'bitcoin' })
  // let utxos5 = UtxoCollection.fromJSON(fixtures.fixture1, { coin: 'bitcoin' })
  // let newUtxos = utxo4.merge(utxos5)

  t.end()
})
