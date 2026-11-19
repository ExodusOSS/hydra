import { bitcoin } from './_fixtures.js'

test('equals() should return true if any number with unit is equivalent', function () {
  expect(bitcoin.BTC('1.53').equals(bitcoin.bits(1_530_000))).toBeTruthy()
  expect(bitcoin.BTC('1.53').equals(bitcoin.bits(1_530_001))).toBeFalsy()
})
