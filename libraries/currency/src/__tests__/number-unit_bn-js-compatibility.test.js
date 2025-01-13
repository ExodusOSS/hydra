import { bitcoin } from './_fixtures.js'
import BN from 'bn.js'

test('bits factory rejects bn.js', function () {
  const amtBTC = bitcoin.BTC(1.53)

  expect(() => bitcoin.bits(new BN(1_530_000))).toThrow()
  const amtBits = bitcoin.bits(1_530_000)

  expect(amtBTC.toString()).toBe('1.53 BTC')
  expect(amtBits.toString()).toBe('1530000 bits')

  expect(amtBTC.equals(amtBits)).toBeTruthy()
  expect(amtBits.equals(amtBits)).toBeTruthy()
})

test('default factory rejects bn.js', function () {
  expect(() => bitcoin.defaultUnit(new BN(2))).toThrow()
  expect(() => bitcoin.BTC(new BN(2))).toThrow()
  expect(() => bitcoin.bits(new BN(2_000_000))).toThrow()

  const amtBTC = bitcoin.BTC(2)
  const amtBits = bitcoin.bits(2_000_000)

  expect(amtBTC.toString()).toBe('2 BTC')
  expect(amtBits.toString()).toBe('2000000 bits')

  expect(amtBTC.equals(amtBits)).toBeTruthy()
  expect(amtBits.equals(amtBits)).toBeTruthy()
})

test('baseUnit factory accepts bn.js', function () {
  const b1 = bitcoin.baseUnit(new BN('153000000'))
  expect(b1.toString()).toBe('153000000 satoshis')

  const b2 = b1.toBase()
  expect(b2.toString()).toBe('153000000 satoshis')

  expect(b1.equals(b2)).toBeTruthy()
})
