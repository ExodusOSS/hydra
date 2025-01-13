import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import * as fixtures from './fixtures/index.cjs'

test('clone()', function (t) {
  t.plan(1)

  const utxos1 = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })
  const utxos2 = utxos1.clone()

  t.true(utxos1.equals(utxos2), 'cloned utxos are equal')

  t.end()
})
