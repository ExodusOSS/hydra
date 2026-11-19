import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import * as fixtures from './fixtures/index.js'

test('replace address utxos', function (t) {
  t.plan(10)

  const utxos = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })
  t.is(utxos.value.toDefaultString({ unit: true }), '15 BTC', 'initial value')
  t.is(
    utxos.getAddressUtxos('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT').toArray().length,
    2,
    'initial utxos'
  )
  t.is(utxos.toArray().length, 5, '5 total utxos')

  // utxos for only one address
  const utxos2 = UtxoCollection.fromJSON(fixtures.fixture2, { currency: assets.bitcoin.currency })
  t.is(utxos2.value.toDefaultString({ unit: true }), '10.5 BTC', 'value of address utxos to merge')
  t.is(
    utxos2.getAddressUtxos('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT').toArray().length,
    1,
    'new utxos'
  )
  t.is(utxos2.toArray().length, 1, '1 total utxos')

  const utxosFinal = utxos.merge(utxos2)
  t.is(utxosFinal.value.toDefaultString({ unit: true }), '22.5 BTC', 'merged value')
  t.is(
    utxosFinal.getAddressUtxos('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT').toArray().length,
    1,
    'new utxos merged'
  )
  t.same(
    utxosFinal.getAddressUtxos('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT').toArray(),
    utxos2.getAddressUtxos('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT').toArray(),
    'merged same'
  )
  t.is(utxosFinal.toArray().length, 4, '4 total utxos')

  t.end()
})

test('merge address utxos', function (t) {
  t.plan(6)

  const utxos = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })
  t.is(utxos.value.toDefaultString({ unit: true }), '15 BTC', 'initial value')
  t.is(
    utxos.getAddressUtxos('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT').toArray().length,
    2,
    'initial utxos'
  )
  t.is(utxos.toArray().length, 5, '5 total utxos')

  // utxos for only one address
  const utxos2 = UtxoCollection.fromJSON(fixtures.fixture2, { currency: assets.bitcoin.currency })
  t.is(utxos2.value.toDefaultString({ unit: true }), '10.5 BTC', 'value of address utxos to merge')
  t.is(
    utxos2.getAddressUtxos('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT').toArray().length,
    1,
    'new utxos'
  )
  t.is(utxos2.toArray().length, 1, '1 total utxos')

  t.end()
})

test('add new utxos', function (t) {
  // t.plan(7)

  const utxos = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })
  t.is(utxos.value.toDefaultString({ unit: true }), '15 BTC', 'initial value')
  t.is(
    utxos.getAddressUtxos('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT').toArray().length,
    2,
    'initial utxos'
  )
  t.is(utxos.toArray().length, 5, '5 total utxos')

  const utxos3 = UtxoCollection.fromJSON(fixtures.fixture3, { currency: assets.bitcoin.currency })
  t.is(utxos3.value.toDefaultString({ unit: true }), '7.7 BTC', 'value of address utxos to merge')
  t.is(utxos3.toArray().length, 2, '2 total utxos')

  const utxosFinal = utxos.merge(utxos3)
  t.is(utxosFinal.value.toDefaultString({ unit: true }), '22.7 BTC', 'merged value')
  t.is(utxosFinal.toArray().length, 7, '7 total utxos')

  t.end()
})
