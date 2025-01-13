import { bitcoin } from './_fixtures.js'

test('is number zero?', function () {
  const b1 = bitcoin.BTC(1.53)
  const b2 = bitcoin.BTC(-1.53)
  const b3 = bitcoin.bits(+0)
  const b4 = bitcoin.BTC(-0)
  const b5 = bitcoin.BTC('-0')
  const b6 = bitcoin.BTC('+0')

  expect(b1.isZero).toBeFalsy()
  expect(b2.isZero).toBeFalsy()
  expect(b3.isZero).toBeTruthy()
  expect(b4.isZero).toBeTruthy()
  expect(b5.isZero).toBeTruthy()
  expect(b6.isZero).toBeTruthy()
})
