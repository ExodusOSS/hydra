import { bitcoin } from './_fixtures'

test('parse() should return a NumberUnit from the string representation', function() {
  const b1 = bitcoin.parse('5 BTC')
  const b2 = bitcoin.parse('5000000 bits')

  expect(b1.toString()).toBe('5 BTC')
  expect(b2.toString()).toBe('5000000 bits')

  expect(b1.equals(b2)).toBeTruthy()
})

test('parse() should throw an error if unit is invalid / not found on UnitType', function() {
  expect(function() {
    bitcoin.parse('3.5 INVALID_UNIT')
  }).toThrowError(/Unit.*not found.*/)
})

test('parse() negative numbers', function() {
  let num = bitcoin.parse('-5 BTC')
  expect(num.isNegative).toBeTruthy()
  expect(num.toString()).toBe('-5 BTC')
})
