import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import * as fixtures from './fixtures/index.cjs'

test('getAddressesForTxId() should return AddressSet for a tx id', function (t) {
  const utxos = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })
  const addrs = utxos.getAddressesForTxId(
    '17abd6c7481efe452f92ff5d55bb638bba9c0c1edc61703c7a7b3ecdf5b1f639'
  )

  t.true(addrs.has('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT'), 'has 12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT')
  t.true(addrs.has('1DsmjSCFZbjMAAtoSQAMujqZz94KHxLSHv'), 'has 1DsmjSCFZbjMAAtoSQAMujqZz94KHxLSHv')

  t.end()
})
