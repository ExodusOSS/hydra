import { bitcoin } from './_fixtures.js'

test('isNegative() should return true if negative amount', function () {
  const b1 = bitcoin.BTC(1)
  expect(b1.isNegative).toBeFalsy()

  const b2 = bitcoin.BTC(-1)
  expect(b2.isNegative).toBeTruthy()

  const b3 = bitcoin.BTC(-0)
  expect(b3.isNegative).toBeFalsy() // no more negative 0 support

  const b4 = bitcoin.BTC(0)
  expect(b4.isNegative).toBeFalsy()

  const b5 = bitcoin.BTC(+0)
  expect(b5.isNegative).toBeFalsy()
})
