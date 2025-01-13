import { bitcoin } from './_fixtures.js'

test('add() should work with numbers', function () {
  const one = bitcoin.BTC(1)
  const b1 = bitcoin.BTC(1.53)
  const b2 = b1.add(one)
  expect(b2.toString()).toBe('2.53 BTC')

  const zero = bitcoin.ZERO
  const b3 = b2.add(zero)
  expect(b3.toString()).toBe('2.53 BTC')

  const b4 = bitcoin.ZERO
  const b5 = b4.add(b1)
  expect(b5.toString()).toBe('1.53 BTC')
})

test('add() should work with number unit', function () {
  const b1 = bitcoin.BTC(1.53)
  const b2 = bitcoin.BTC(2.02)
  const b3 = b1.add(b2)
  expect(b3.toString()).toBe('3.55 BTC')

  const b4 = bitcoin.bits(2_000_000)
  const b5 = b3.add(b4)
  expect(b5.toString()).toBe('5.55 BTC')

  const b6 = bitcoin.satoshis(2_000_000)
  const b7 = b5.add(b6)
  expect(b7.toString()).toBe('5.57 BTC')
})

test('add() should add 0 correctly', function () {
  const zero = bitcoin.ZERO
  const b1 = bitcoin.BTC(1.53)
  const b2 = b1.add(zero)
  expect(b2.toString()).toBe('1.53 BTC')

  const e1 = bitcoin.ZERO
  const b3 = b2.add(e1)
  expect(b3.toString()).toBe('1.53 BTC')

  const b4 = bitcoin.ZERO
  const b5 = b3.add(b4)
  expect(b5.toString()).toBe('1.53 BTC')

  const b6 = bitcoin.satoshis(0)
  const b7 = b5.add(b6)
  expect(b7.toString()).toBe('1.53 BTC')

  const b8 = bitcoin.satoshis(153_000_000)
  const b9 = bitcoin.BTC(0)
  const b10 = b8.add(b9)
  expect(b10.toString()).toBe('153000000 satoshis')
})

test('add() should add to 0 correctly', function () {
  const zero = bitcoin.ZERO
  const b1 = bitcoin.BTC(1.53)
  const b2 = zero.add(b1)
  expect(b2.toString()).toBe('1.53 BTC')

  const b4 = bitcoin.BTC(zero)
  const b5 = b4.add(b2)
  expect(b5.toString()).toBe('1.53 BTC')

  const b8 = bitcoin.satoshis(0)
  const b9 = bitcoin.BTC(1.53)
  const b10 = b8.add(b9)
  expect(b10.toString()).toBe('153000000 satoshis')
})
