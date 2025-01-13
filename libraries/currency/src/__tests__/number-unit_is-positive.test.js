import { bitcoin } from './_fixtures.js'

test('isPositive() should return true if positive amount', function () {
  const b1 = bitcoin.BTC(1)
  expect(b1.isPositive).toBeTruthy()

  const b2 = bitcoin.BTC(-1)
  expect(b2.isPositive).toBeFalsy()

  const b3 = bitcoin.BTC(-0)
  expect(b3.isPositive).toBeFalsy() // no more negative 0 support

  const b4 = bitcoin.BTC(0)
  expect(b4.isPositive).toBeFalsy()

  const b5 = bitcoin.BTC(+0)
  expect(b5.isPositive).toBeFalsy()
})
