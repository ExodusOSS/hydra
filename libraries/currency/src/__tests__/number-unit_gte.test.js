import { bitcoin } from './_fixtures.js'

test('greater than with positive numbers', function () {
  const b1 = bitcoin.BTC(1.53)
  const b2 = bitcoin.BTC(1.53)
  const b3 = bitcoin.bits(1_530_001)
  const b4 = bitcoin.BTC(1.54)

  expect(b1.gte(b2)).toBeTruthy()
  expect(b2.gte(b1)).toBeTruthy()

  expect(b3.gte(b1)).toBeTruthy()
  expect(b1.gte(b3)).toBeFalsy()

  expect(b4.gte(b3)).toBeTruthy()
  expect(b3.gte(b4)).toBeFalsy()
})

test('greater than with negative numbers', function () {
  const b0 = bitcoin.BTC(0)
  const b1 = bitcoin.BTC(-1)
  const b2 = bitcoin.BTC(-2)
  const b3 = bitcoin.BTC(1)

  expect(b0.gte(b1)).toBeTruthy()
  expect(b1.gte(b0)).toBeFalsy()

  expect(b1.gte(b2)).toBeTruthy()
  expect(b2.gte(b1)).toBeFalsy()

  expect(b3.gte(b1)).toBeTruthy()
  expect(b1.gte(b3)).toBeFalsy()
})
