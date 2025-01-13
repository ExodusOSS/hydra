import lodash from 'lodash'
import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import fixtures from './fixtures/index.cjs'

const { fixture1: fixture } = fixtures
const { cloneDeep: clone } = lodash

test('set utxos for an address', function (t) {
  const addresses = Object.keys(fixture)
  const addr1Utxos = { [addresses[0]]: clone(fixture[addresses[0]]) }
  const addr2Utxos = { [addresses[1]]: clone(fixture[addresses[1]]) }

  const utxoCol1 = UtxoCollection.fromJSON(addr1Utxos, { currency: assets.bitcoin.currency })
  const utxoCol2 = UtxoCollection.fromJSON(addr2Utxos, { currency: assets.bitcoin.currency })
  const utxoTotal = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })
  const utxoEmpty = UtxoCollection.fromArray([], { currency: assets.bitcoin.currency })

  const u1 = utxoEmpty.setAddressUtxos(addresses[0], utxoCol1)
  t.same(u1.toJSON(), utxoCol1.toJSON(), 'empty + col1 = col1')
  const u2 = utxoEmpty.setAddressUtxos(addresses[1], utxoCol2)
  t.same(u2.toJSON(), utxoCol2.toJSON(), 'empty + col2 = col2')

  const u1a = utxoEmpty.setAddressUtxos(addresses[0], utxoCol1.toArray())
  t.same(u1a.toJSON(), utxoCol1.toJSON(), 'empty + col1 = col1 (array)')
  const u2a = utxoEmpty.setAddressUtxos(addresses[1], utxoCol2.toArray())
  t.same(u2a.toJSON(), utxoCol2.toJSON(), 'empty + col2 = col2 (array)')

  const ut = utxoEmpty
    .setAddressUtxos(addresses[0], utxoCol1)
    .setAddressUtxos(addresses[1], utxoCol2)
  t.same(ut.toJSON(), utxoTotal.toJSON(), 'empty + col1 + col2 == total')

  const utm1 = utxoTotal.setAddressUtxos(addresses[0], [])
  t.same(utm1.toJSON(), utxoCol2.toJSON(), 'total - col1 = col2')

  const utm2 = utxoTotal.setAddressUtxos(addresses[1], [])
  t.same(utm2.toJSON(), utxoCol1.toJSON(), 'total - col2 = col1')

  const utm1m2 = utxoTotal.setAddressUtxos(addresses[0], []).setAddressUtxos(addresses[1], [])
  t.same(utm1m2.toJSON(), utxoEmpty.toJSON(), 'total - col1 - col2 = empty')

  t.end()
})
