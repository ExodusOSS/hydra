import { bitcoin } from './_fixtures.js'

test('negate() should return negated value', function () {
  const b1 = bitcoin.BTC(-1.53)
  expect(b1.toString()).toBe('-1.53 BTC')
  expect(b1.isNegative).toBeTruthy()

  const b2 = b1.negate()
  expect(b2.toString()).toBe('1.53 BTC')
  expect(b2.isNegative).toBeFalsy()

  const b3 = b2.negate()
  expect(b3.toString()).toBe('-1.53 BTC')
  expect(b3.isNegative).toBeTruthy()
})
