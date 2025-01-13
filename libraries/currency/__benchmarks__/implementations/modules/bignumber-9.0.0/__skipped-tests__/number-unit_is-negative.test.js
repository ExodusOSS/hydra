import { bitcoin } from './_fixtures'

test('isNegative() should return true if negative amount', function() {
  let b1 = bitcoin.BTC(1)
  expect(b1.isNegative).toBeFalsy()

  let b2 = bitcoin.BTC(-1)
  expect(b2.isNegative).toBeTruthy()

  // let b3 = bitcoin.BTC(-0)
  // maybe configurable -0?
  // expect(b3.isNegative).toBeTruthy()

  let b4 = bitcoin.BTC(0)
  expect(b4.isNegative).toBeFalsy()

  let b5 = bitcoin.BTC(+0)
  expect(b5.isNegative).toBeFalsy()
})
