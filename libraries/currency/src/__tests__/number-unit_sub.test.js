import { bitcoin } from './_fixtures.js'

test('sub() should work with numbers', function () {
  const one = bitcoin.BTC(1)
  const b1 = bitcoin.BTC(1.53)
  const b2 = b1.sub(one)
  expect(b2.toString()).toBe('0.53 BTC')

  const zero = bitcoin.ZERO
  const b3 = b2.sub(zero)
  expect(b3.toString()).toBe('0.53 BTC')

  const b4 = bitcoin.ZERO
  const b5 = b4.sub(b1)
  expect(b5.toString()).toBe('-1.53 BTC')
})

test('sub() should work with number unit', function () {
  const b1 = bitcoin.BTC(1.53)
  const b2 = bitcoin.BTC(2.02)
  const b3 = b1.sub(b2)
  expect(b3.toString()).toBe('-0.49 BTC')

  const b4 = bitcoin.bits(2_000_000)
  const b5 = b3.sub(b4)
  expect(b5.toString()).toBe('-2.49 BTC')

  const b6 = bitcoin.satoshis(2_000_000)
  const b7 = b5.sub(b6)
  expect(b7.toString()).toBe('-2.51 BTC')
})

test('sub() should sub 0 correctly', function () {
  const zero = bitcoin.ZERO
  const b1 = bitcoin.BTC(1.53)
  const b2 = b1.sub(zero)
  expect(b2.toString()).toBe('1.53 BTC')

  const e1 = bitcoin.ZERO
  const b3 = b2.sub(e1)
  expect(b3.toString()).toBe('1.53 BTC')

  const b4 = bitcoin.ZERO
  const b5 = b3.sub(b4)
  expect(b5.toString()).toBe('1.53 BTC')

  const b6 = bitcoin.satoshis(0)
  const b7 = b5.sub(b6)
  expect(b7.toString()).toBe('1.53 BTC')

  const b8 = bitcoin.satoshis(153_000_000)
  const b9 = bitcoin.ZERO
  const b10 = b8.sub(b9)
  expect(b10.toString()).toBe('153000000 satoshis')
})

test('sub() should sub off 0 correctly', function () {
  const zero = bitcoin.ZERO
  const b1 = bitcoin.BTC(1.53)
  const b2 = zero.sub(b1)
  expect(b2.toString()).toBe('-1.53 BTC')

  const b4 = bitcoin.ZERO
  const b5 = b4.sub(b2)
  expect(b5.toString()).toBe('1.53 BTC')

  const b6 = bitcoin.ZERO
  const b7 = b6.sub(b5)
  expect(b7.toString()).toBe('-1.53 BTC')

  const b8 = bitcoin.satoshis(0)
  const b9 = bitcoin.BTC(1.53)
  const b10 = b8.sub(b9)
  expect(b10.toString()).toBe('-153000000 satoshis')
})
