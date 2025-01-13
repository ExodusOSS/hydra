import { bitcoin } from './_fixtures.js'

test('bits factory accepts BigInt', function () {
  const amtBTC = bitcoin.BTC(1.53)
  const amtBits = bitcoin.bits(BigInt(1_530_000))

  expect(amtBTC.toString()).toBe('1.53 BTC')
  expect(amtBits.toString()).toBe('1530000 bits')

  expect(amtBTC.equals(amtBits)).toBeTruthy()
  expect(amtBits.equals(amtBits)).toBeTruthy()
})

test('default factory accepts BigInt', function () {
  const amtBTC = bitcoin.BTC(BigInt(2))
  const amtBits = bitcoin.bits(BigInt(2_000_000))
  expect(amtBTC.toString()).toBe('2 BTC')
  expect(amtBits.toString()).toBe('2000000 bits')

  expect(amtBTC.equals(amtBits)).toBeTruthy()
  expect(amtBits.equals(amtBits)).toBeTruthy()
})

test('baseUnit() factory accepts BigInt', function () {
  const b1 = bitcoin.baseUnit(BigInt('153000000'))
  expect(b1.toString()).toBe('153000000 satoshis')

  const b2 = b1.toBase()
  expect(b2.toString()).toBe('153000000 satoshis')

  expect(b1.equals(b2)).toBeTruthy()
})
