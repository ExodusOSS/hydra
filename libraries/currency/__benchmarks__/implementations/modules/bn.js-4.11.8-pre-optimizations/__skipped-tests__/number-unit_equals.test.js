import { bitcoin } from './_fixtures'

test('equals() should return true if any number with unit is equivalent', function() {
  expect(bitcoin.BTC('1.53').equals(bitcoin.bits(1530000))).toBeTruthy()
  expect(bitcoin.BTC('1.53').equals(bitcoin.bits(1530001))).toBeFalsy()
})
