import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import * as fixtures from './fixtures/index.cjs'

test('> when address does not exist, should throw', function (t) {
  const utxos = UtxoCollection.fromJSON(fixtures.fixture3, { currency: assets.bitcoin.currency })

  t.throws(
    () => {
      utxos.getAddressUtxos('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT')
    },
    /12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT is not present/,
    'address not present'
  )

  t.end()
})

test('> when address object, should not throw', function (t) {
  const utxos = UtxoCollection.fromJSON(fixtures.fixture3, { currency: assets.bitcoin.currency })
  t.is(utxos.addresses.size, 1)
  const addr1 = utxos.addresses.toArray()[0]

  const utxos2 = utxos.getAddressUtxos(addr1)
  t.same(utxos.toJSON(), utxos2.toJSON(), 'same utxos')

  t.end()
})
