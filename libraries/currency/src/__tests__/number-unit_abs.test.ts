import { bitcoin } from './_fixtures.js'

test('abs() should return absolute value', function () {
  const b1 = bitcoin.BTC(-1.53)
  expect(b1.toString()).toBe('-1.53 BTC')

  const b2 = b1.abs()
  expect(b2.toString()).toBe('1.53 BTC')

  const b3 = b2.abs()
  expect(b3.toString()).toBe('1.53 BTC')
})
