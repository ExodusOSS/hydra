import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import AddressSet from '../../address-set/index.js'
import UtxoCollection from '../index.js'
import * as fixtures from './fixtures/index.js'

test('returns AddressSet', function (t) {
  const utxos = UtxoCollection.fromJSON(fixtures.fixture8, { currency: assets.bitcoin.currency })

  t.true(utxos.addresses instanceof AddressSet, 'return an address-set')
  t.is(utxos.addresses.size, 3, '3 addresses returned')

  t.end()
})

test('sorts addresses', function (t) {
  const utxos = UtxoCollection.fromJSON(fixtures.fixture8, { currency: assets.bitcoin.currency })

  const arr = utxos.addresses.toArray()
  t.is(arr[0].meta.path, 'm/0/0', 'm/0/0 sorted first')
  t.is(arr[1].meta.path, 'm/0/2', 'm/0/2 sorted second')
  t.is(arr[2].meta.path, 'm/2/0', 'm/2/0 sorted third')

  t.end()
})
