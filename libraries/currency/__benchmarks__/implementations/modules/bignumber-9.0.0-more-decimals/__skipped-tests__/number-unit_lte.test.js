import { bitcoin } from './_fixtures'

test('less than with positive numbers', function() {
  const b1 = bitcoin.BTC(1.53)
  const b2 = bitcoin.BTC(1.53)
  const b3 = bitcoin.bits(1530001)
  const b4 = bitcoin.BTC(1.54)

  expect(b1.lte(b2)).toBeTruthy()
  expect(b2.lte(b1)).toBeTruthy()

  expect(b3.lte(b1)).toBeFalsy()
  expect(b1.lte(b3)).toBeTruthy()

  expect(b4.lte(b3)).toBeFalsy()
  expect(b3.lte(b4)).toBeTruthy()
})

test('less than with negative numbers', function() {
  const b0 = bitcoin.BTC(0)
  const b1 = bitcoin.BTC(-1)
  const b2 = bitcoin.BTC(-2)
  const b3 = bitcoin.BTC(1)

  expect(b0.lte(b1)).toBeFalsy()
  expect(b1.lte(b0)).toBeTruthy()

  expect(b1.lte(b2)).toBeFalsy()
  expect(b2.lte(b1)).toBeTruthy()

  expect(b3.lte(b1)).toBeFalsy()
  expect(b1.lte(b3)).toBeTruthy()
})
