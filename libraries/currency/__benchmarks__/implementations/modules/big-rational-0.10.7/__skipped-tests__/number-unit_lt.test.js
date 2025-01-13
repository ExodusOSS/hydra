import { bitcoin } from './_fixtures'

test('less than with positive numbers', function() {
  const b1 = bitcoin.BTC(1.53)
  const b2 = bitcoin.BTC(1.53)
  const b3 = bitcoin.bits(1530001)
  const b4 = bitcoin.BTC(1.54)

  expect(b1.lt(b2)).toBeFalsy()
  expect(b2.lt(b1)).toBeFalsy()

  expect(b3.lt(b1)).toBeFalsy()
  expect(b1.lt(b3)).toBeTruthy()

  expect(b4.lt(b3)).toBeFalsy()
  expect(b3.lt(b4)).toBeTruthy()
})

test('less than with negative numbers', function() {
  const b0 = bitcoin.BTC(0)
  const b1 = bitcoin.BTC(-1)
  const b2 = bitcoin.BTC(-2)
  const b3 = bitcoin.BTC(1)

  expect(b0.lt(b1)).toBeFalsy()
  expect(b1.lt(b0)).toBeTruthy()

  expect(b1.lt(b2)).toBeFalsy()
  expect(b2.lt(b1)).toBeTruthy()

  expect(b3.lt(b1)).toBeFalsy()
  expect(b1.lt(b3)).toBeTruthy()
})
