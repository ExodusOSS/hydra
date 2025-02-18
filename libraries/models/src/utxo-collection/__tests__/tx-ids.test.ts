import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import * as fixtures from './fixtures/index.js'

test('replace address utxos', function (t) {
  t.plan(2)

  const utxos = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })
  const txIds = utxos.txIds
  t.is(utxos.toArray().length, 5, '5 total utxos')
  t.same(
    txIds,
    [
      '17abd6c7481efe452f92ff5d55bb638bba9c0c1edc61703c7a7b3ecdf5b1f639',
      '6bd212961be413c851207e327c04ed9bd92fc5aa0194e968da3c40c8316d3f24',
      '7bd212961be413c851207e327c04ed9bd92fc5aa0194e968da3c40c8316d3f24',
    ],
    'unique tx Ids'
  )

  t.end()
})
