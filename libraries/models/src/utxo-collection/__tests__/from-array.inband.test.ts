import { isNumberUnit } from '@exodus/currency'

import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import type { RawUtxo } from '../index.js'
import UtxoCollection from '../index.js'
import { fixture1 as fixture, fixture7 } from './fixtures/index.js'

test('> when empty array, should create empty collection', function (t) {
  t.plan(2)
  const col = UtxoCollection.fromArray([], { currency: assets.bitcoin.currency })
  t.is(col.size, 0, '0 size')
  t.is(col.value.toDefaultNumber(), 0, '0 value')
  t.end()
})

test('fromArray() should create empty when null or undefined', function (t) {
  t.plan(4)

  const col = UtxoCollection.fromArray(null, { currency: assets.bitcoin.currency })
  t.is(col.size, 0, '0 size')
  t.is(col.value.toDefaultString({ unit: true }), '0 BTC', '0 value')

  const col2 = UtxoCollection.fromArray(null, { currency: assets.bitcoin.currency })
  t.is(col2.size, 0, '0 size')
  t.is(col2.value.toDefaultString({ unit: true }), '0 BTC', '0 value')

  t.end()
})

test('create collection from array', function (t) {
  const utxoCol = UtxoCollection.fromJSON(fixture7, { currency: assets.bitcoin.currency })
  const utxos = utxoCol.toArray()

  const newCol = UtxoCollection.fromArray(utxos)
  t.is(newCol.addresses.size, 2, '2 addresses')
  t.is(newCol.value.toDefaultString({ unit: true }), '15 BTC', 'total value')
  t.is(newCol.size, 5, 'size is set')

  Object.setPrototypeOf(fixture7, null)
  t.same(newCol.toJSON(), fixture7, 'data is same')

  t.end()
})

// NumberUnit can't handle this yet => parse of numbers without units
test.skip('create collection from array, utxo values are strings', function (t) {
  const utxoCol = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })
  const utxos = utxoCol.toArray()

  t.true(
    utxos.every((utxo) => isNumberUnit(utxo.value)),
    'values are number units'
  )
  const rawUtxos: RawUtxo[] = utxos.map((utxo) => ({
    ...utxo,
    value: utxo.value.toDefaultString(),
  }))
  t.true(
    rawUtxos.every((utxo) => typeof utxo.value === 'string'),
    'values are strings without string unit'
  )

  const newCol = UtxoCollection.fromArray(rawUtxos)
  t.is(newCol.addresses.size, 2, '2 addresses')
  t.is(newCol.value.toDefaultString({ unit: true }), '15 BTC', 'total value')
  t.is(newCol.size, 5, 'size is set')

  t.same(newCol.toJSON(), fixture, 'data is same')

  t.end()
})

test('should not allow duplicates', (t) => {
  t.plan(2)

  const utxoCol = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })

  const arr = [...utxoCol.toArray(), ...utxoCol.toArray(), ...utxoCol.toArray()]
  t.is(arr.length, utxoCol.size * 3, 'verify size is 3x')

  const utxoCol2 = UtxoCollection.fromArray(arr)
  t.deepEquals(utxoCol.toJSON(), utxoCol2.toJSON(), 'collections are the same')

  t.end()
})

test('should raise when utxos.address is not provided', () => {
  const utxoCol = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })

  const arr = [...utxoCol.toArray()]

  // @ts-expect-error -- testing invalid data (address is not optional, so cannot be removed normally)
  delete arr[0].address

  expect(() => UtxoCollection.fromArray(arr)).toThrow('utxo.address must be provided')
})

test('should raise when utxos.address is a string', () => {
  const utxoCol = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })

  const arr = [...utxoCol.toArray()]

  // @ts-expect-error -- testing with invalid type but supported data
  arr[0]!.address = arr[0]!.address.toString()

  expect(() => UtxoCollection.fromArray(arr)).toThrow(
    'Must pass addressMap if utxo.address is not of type Address'
  )
})

test('should not raise when utxos.address is a string and addressMap is provided', () => {
  const utxoCol = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })

  const arr = [...utxoCol.toArray()]

  const addressMap = { [arr[0]!.address.toString()]: arr[0]!.address }

  // @ts-expect-error -- testing with invalid type but supported data
  arr[0]!.address = arr[0]!.address.toString()

  const utxoCol2 = UtxoCollection.fromArray(arr, { addressMap })
  expect(utxoCol.toJSON()).toEqual(utxoCol2.toJSON())
})
