import BigIntWrapper from '@exodus/bigint'

import { bitcoin, dollar, ethereum } from '../_fixtures.js'

const satoshisNumberUnit = bitcoin.satoshis('12345')
const bitcoinNU = bitcoin.BTC('1.2345')
const ethereumNU = ethereum.ETH('1.2345')
const dollarNU = dollar.USD('1.2345')

const nSatoshisNumberUnit = bitcoin.satoshis('-12345')
const nBitcoinNU = bitcoin.BTC('-1.2345')
const nEthereumNU = ethereum.ETH('-1.2345')
const nDollarNU = dollar.USD('-1.2345')

const zBitcoinNU = bitcoin.BTC('0')
const zEthereumNU = ethereum.ETH('0')
const zDollarNU = dollar.USD('0')

const nzBitcoinNU = bitcoin.BTC('-0')
const nzEthereumNU = ethereum.ETH('-0')

const customBNMatcher = (a, b) => {
  if (a && b && a instanceof BigIntWrapper && b instanceof BigIntWrapper) {
    expect(a.eq(b)).toBe(true)
    return true
  }
}

expect.extend({
  toEqual(received, expected) {
    const pass = this.equals(received, expected, [customBNMatcher])

    if (pass) {
      return {
        message: () => `expected ${received} not to equal ${expected}`,
        pass: true,
      }
    }

    return {
      message: () => `expected ${received} to equal ${expected}`,
      pass: false,
    }
  },
})

test('must pass in UnitType', function () {
  expect(() => bitcoinNU.cast(null)).toThrow('unitType needs to be a UnitType instance')
  expect(() => bitcoinNU.cast(123)).toThrow('unitType needs to be a UnitType instance')
  expect(() => bitcoinNU.cast({})).toThrow('unitType needs to be a UnitType instance')
  expect(() => bitcoinNU.cast(ethereumNU.unit)).toThrow('unitType needs to be a UnitType instance')
  expect(() => bitcoinNU.cast(ethereumNU)).toThrow('unitType needs to be a UnitType instance')

  expect(() => bitcoinNU.cast(ethereumNU.unitType)).not.toThrow()
  expect(() => bitcoinNU.cast(bitcoinNU.unitType)).not.toThrow()
  expect(() => bitcoinNU.cast(dollarNU.unitType)).not.toThrow()
})

test('converts 0 amount', function () {
  expect(zBitcoinNU.cast(zEthereumNU.unitType)).toEqual(zEthereumNU.toBase())
  expect(zBitcoinNU.cast(zEthereumNU.unitType)).not.toEqual(zEthereumNU)

  expect(nzBitcoinNU.cast(nzEthereumNU.unitType)).toEqual(nzEthereumNU.toBase())
  expect(nzBitcoinNU.cast(nzEthereumNU.unitType)).not.toEqual(nzEthereumNU)

  expect(zBitcoinNU.cast(zDollarNU.unitType)).toEqual(zDollarNU.toBase())
  expect(zBitcoinNU.cast(zDollarNU.unitType)).not.toEqual(zDollarNU)

  expect(zEthereumNU.cast(zDollarNU.unitType)).toEqual(zDollarNU.toBase())
  expect(zEthereumNU.cast(zDollarNU.unitType)).not.toEqual(zDollarNU)
})

test('converts same instance only when needed', function () {
  expect(bitcoinNU.cast(bitcoinNU.unitType)).toEqual(bitcoinNU.toBase())
  expect(bitcoinNU.cast(bitcoinNU.unitType)).not.toEqual(bitcoinNU)

  expect(satoshisNumberUnit.cast(bitcoinNU.unitType)).toBe(satoshisNumberUnit)
  expect(satoshisNumberUnit.cast(bitcoinNU.unitType)).not.toEqual(satoshisNumberUnit.toDefault())

  expect(nBitcoinNU.cast(nBitcoinNU.unitType)).toEqual(nBitcoinNU.toBase())
  expect(nBitcoinNU.cast(nBitcoinNU.unitType)).not.toEqual(nBitcoinNU)

  expect(nSatoshisNumberUnit.cast(bitcoinNU.unitType)).toBe(nSatoshisNumberUnit)
  expect(nSatoshisNumberUnit.cast(bitcoinNU.unitType)).not.toEqual(nSatoshisNumberUnit.toDefault())
})

test('converting to less power truncates decimals', function () {
  const bitcoinNU8Digits = bitcoin.BTC('0.12345678')
  const nBitcoinNU8Digits = bitcoin.BTC('-0.12345678')

  const ethereumNU16Digits = ethereum.ETH('0.1234567890123456')
  const nEthereumNU16Digits = ethereum.ETH('-0.1234567890123456')

  const ethereumNU16Digits1 = ethereum.ETH('0.1234567800123456')
  const nEthereumNU16Digits1 = ethereum.ETH('-0.1234567800123456')

  expect(ethereumNU16Digits.cast(bitcoinNU8Digits.unitType)).toEqual(bitcoinNU8Digits.toBase())
  expect(ethereumNU16Digits.cast(bitcoinNU8Digits.unitType)).not.toEqual(bitcoinNU8Digits)

  expect(nEthereumNU16Digits.cast(nBitcoinNU8Digits.unitType)).toEqual(nBitcoinNU8Digits.toBase())
  expect(nEthereumNU16Digits.cast(nBitcoinNU8Digits.unitType)).not.toEqual(nBitcoinNU8Digits)

  expect(ethereumNU16Digits1.cast(bitcoinNU8Digits.unitType)).toEqual(bitcoinNU8Digits.toBase())
  expect(ethereumNU16Digits1.cast(bitcoinNU8Digits.unitType)).not.toEqual(bitcoinNU8Digits)

  expect(nEthereumNU16Digits1.cast(nBitcoinNU8Digits.unitType)).toEqual(nBitcoinNU8Digits.toBase())
  expect(nEthereumNU16Digits1.cast(nBitcoinNU8Digits.unitType)).not.toEqual(nBitcoinNU8Digits)
})

test('converts to same decimals', function () {
  expect(bitcoinNU.cast(dollarNU.unitType)).toEqual(dollarNU.toBase())
  expect(bitcoinNU.cast(dollarNU.unitType)).not.toEqual(dollarNU)

  expect(nBitcoinNU.cast(nDollarNU.unitType)).toEqual(nDollarNU.toBase())
  expect(nBitcoinNU.cast(nDollarNU.unitType)).not.toEqual(nDollarNU)
})

test('converts to more decimals', function () {
  expect(bitcoinNU.cast(ethereumNU.unitType)).toEqual(ethereumNU.toBase())
  expect(bitcoinNU.cast(ethereumNU.unitType)).not.toEqual(ethereumNU)

  expect(nBitcoinNU.cast(nEthereumNU.unitType)).toEqual(nEthereumNU.toBase())
  expect(nBitcoinNU.cast(nEthereumNU.unitType)).not.toEqual(nEthereumNU)
})

test('converts to less decimals', function () {
  // powerDiff between eth and btc is 8
  const ethereumNU8Digits = ethereum.ETH('0.12345678')
  const bitcoinNU8Digits = bitcoin.BTC('0.12345678')
  const nEthereumNU8Digits = ethereum.ETH('-0.12345678')
  const nBitcoinNU8Digits = bitcoin.BTC('-0.12345678')

  const ethereumNU16Digits = ethereum.ETH('0.1234567890123456')
  const nEthereumNU16Digits = ethereum.ETH('-0.1234567890123456')

  // equal digits than powerDiff
  expect(ethereumNU8Digits.cast(bitcoinNU8Digits.unitType)).toEqual(bitcoinNU8Digits.toBase())
  expect(ethereumNU8Digits.cast(bitcoinNU8Digits.unitType)).not.toEqual(bitcoinNU8Digits)

  expect(nEthereumNU8Digits.cast(nBitcoinNU8Digits.unitType)).toEqual(nBitcoinNU8Digits.toBase())
  expect(nEthereumNU8Digits.cast(nBitcoinNU8Digits.unitType)).not.toEqual(nBitcoinNU8Digits)

  // less digits than powerDiff
  expect(ethereumNU.cast(bitcoinNU.unitType)).toEqual(bitcoinNU.toBase())
  expect(ethereumNU.cast(bitcoinNU.unitType)).not.toEqual(bitcoinNU)

  expect(nEthereumNU.cast(nBitcoinNU.unitType)).toEqual(nBitcoinNU.toBase())
  expect(nEthereumNU.cast(nBitcoinNU.unitType)).not.toEqual(nBitcoinNU)

  // more digits than powerDiff
  expect(ethereumNU16Digits.cast(bitcoinNU8Digits.unitType)).toEqual(bitcoinNU8Digits.toBase())
  expect(ethereumNU16Digits.cast(bitcoinNU8Digits.unitType)).not.toEqual(bitcoinNU8Digits)

  expect(nEthereumNU16Digits.cast(nBitcoinNU8Digits.unitType)).toEqual(nBitcoinNU8Digits.toBase())
  expect(nEthereumNU16Digits.cast(nBitcoinNU8Digits.unitType)).not.toEqual(nBitcoinNU8Digits)
})
