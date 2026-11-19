import { bitcoin } from '../_fixtures.js'

test('sub() should return the subtraction', function () {
  expect(bitcoin.BTC(3).sub(bitcoin.BTC(2)).toString()).toBe('1 BTC')

  expect(bitcoin.BTC(-3).sub(bitcoin.BTC(2)).toString()).toBe('-5 BTC')

  expect(bitcoin.BTC(3).sub(bitcoin.BTC(-2)).toString()).toBe('5 BTC')

  expect(bitcoin.BTC(-3).sub(bitcoin.BTC(-2)).toString()).toBe('-1 BTC')

  expect(bitcoin.BTC(1.5).sub(bitcoin.BTC(2)).toString()).toBe('-0.5 BTC')

  expect(bitcoin.BTC(0.1).sub(bitcoin.satoshis(2)).toString()).toBe('0.09999998 BTC')
})

test('sub() should coerce to NumberUnit', function () {
  expect(bitcoin.BTC(3).sub(bitcoin.BTC(2)).toString()).toBe('1 BTC')

  expect(bitcoin.BTC(3).sub(bitcoin.BTC(-2)).toString()).toBe('5 BTC')

  expect(bitcoin.BTC(-3).sub(bitcoin.BTC('-2.5')).toString()).toBe('-0.5 BTC')

  expect(bitcoin.BTC(1).sub(bitcoin.satoshis(1)).toBaseString({ unit: true })).toBe(
    '99999999 satoshis'
  )
})
