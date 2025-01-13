import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import { fixture1 } from './fixtures/index.cjs'

test('should filter utxos collection', function () {
  const utxos = UtxoCollection.fromJSON(fixture1, {
    currency: assets.bitcoin.currency,
  })
  expect(utxos.value.toDefaultString({ unit: true })).toEqual('15 BTC')
  const filteredUtxos = utxos.filter((utxo) => utxo.value.toDefaultNumber() > 3)
  expect(filteredUtxos.value.toDefaultString({ unit: true })).toEqual('9 BTC')
})

test('should not filter utxos collection', function () {
  const utxos = UtxoCollection.fromJSON(fixture1, { currency: assets.bitcoin.currency })
  const filteredUtxos = utxos.filter((utxo) => utxo.value.toBaseNumber() !== 0)

  expect(filteredUtxos).toEqual(utxos)
})
