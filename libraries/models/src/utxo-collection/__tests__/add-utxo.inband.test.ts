import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import { fixture1 } from './fixtures/index.js'

test('addUtxo should preserve currency from source collection', function (t) {
  const currency = assets.bitcoin.currency
  const utxos = UtxoCollection.fromJSON(fixture1, { currency })

  const existingUtxo = utxos.toArray()[0]!
  const newUtxo = {
    ...existingUtxo,
    txId: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    vout: 0,
    value: currency.parse('3 BTC'),
  }

  const addressMap = { [newUtxo.address.toString()]: newUtxo.address }
  const result = utxos.addUtxo(newUtxo, addressMap)

  t.is(result.currency, currency, 'currency is preserved after addUtxo')
  t.is(result.size, utxos.size + 1, 'new utxo is added')

  t.end()
})

test('addUtxo on empty collection should preserve currency', function (t) {
  const currency = assets.bitcoin.currency
  const empty = UtxoCollection.createEmpty({ currency })

  const utxos = UtxoCollection.fromJSON(fixture1, { currency })
  const existingUtxo = utxos.toArray()[0]!
  const newUtxo = {
    ...existingUtxo,
    txId: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    vout: 0,
    value: '1 BTC',
  }

  const addressMap = { [newUtxo.address.toString()]: newUtxo.address }
  const result = empty.addUtxo(newUtxo as any, addressMap)

  t.is(result.currency, currency, 'currency is preserved when adding to empty collection')
  t.is(result.size, 1, 'utxo is added')
  t.is(result.value.toDefaultString({ unit: true }), '1 BTC', 'value is parsed correctly')

  t.end()
})
