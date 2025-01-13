import { bitcoin, ethereum } from './_fixtures.js'

test('to() other units', function () {
  const b1 = bitcoin.BTC(1.53)

  const b2 = b1.to(bitcoin.bits)
  const b3 = b1.to('bits')

  expect(b2.toString()).toBe('1530000 bits')
  expect(b3.toString()).toBe('1530000 bits')
})

test('to() when undefined or null passed', function () {
  const b1 = bitcoin.BTC(1.53)

  expect(() => b1.to(null)).toThrow()
})

test('to() with conversionUnit undefined or null passed', function () {
  const b1 = bitcoin.BTC(1.53)

  expect(
    b1
      .to(ethereum.ETH, {
        from: bitcoin.BTC,
        fromUnit: 'BTC',
        fromValue: 1,
        to: ethereum.ETH,
        toUnit: 'ETH',
        toValue: 10,
      })
      .toString()
  ).toBe('15.3 ETH')

  expect(
    b1
      .to(ethereum.ETH, {
        from: bitcoin.BTC,
        fromUnit: 'satoshis',
        fromValue: 1,
        to: ethereum.ETH,
        toUnit: 'szabo',
        toValue: 1.5,
      })
      .toDefaultString({ unit: true })
  ).toBe('229.5 ETH')

  expect(
    b1
      .to(ethereum.ETH, {
        from: bitcoin.BTC,
        fromUnit: 'satoshis',
        fromValue: 0.5,
        to: ethereum.ETH,
        toUnit: 'wei',
        toValue: 10_000_000_000,
      })
      .toDefaultString({ unit: true })
  ).toBe('3.06 ETH')
})

test('toString() with unit parameter', function () {
  const b1 = bitcoin.BTC(1.53)

  expect(b1.toString()).toBe('1.53 BTC')
  expect(b1.toString({ unit: false })).toBe('1.53')
  expect(b1.toString({ unit: true })).toBe('1.53 BTC')
})

test('toString() with format parameter', function () {
  const b1 = bitcoin.BTC(1.53)

  expect(b1.toString({ format: (value, unit) => unit + ' ' + value })).toBe('BTC 1.53')
})

test('toNumber()', function () {
  const b1 = bitcoin.BTC(1.53)

  expect(b1.toNumber()).toBe(1.53)
  expect(b1.to('bits').toNumber()).toBe(1_530_000)
})

// https://github.com/ExodusMovement/exodus-core/issues/272
test('toBaseBufferLE()', function () {
  const b1 = bitcoin.satoshis(0x10_00)
  const buf1 = b1.toBaseBufferLE()
  expect(buf1.toString('hex')).toBe('0010')

  const b2 = bitcoin.BTC(1)
  const buf2 = b2.toBaseBufferLE()
  expect(buf2.toString('hex')).toBe('00e1f505')
})

test('toBaseBufferBE()', function () {
  const b1 = bitcoin.satoshis(0x10_00)
  const buf1 = b1.toBaseBufferBE()
  expect(buf1.toString('hex')).toBe('1000')

  const b2 = bitcoin.BTC(1)
  const buf2 = b2.toBaseBufferBE()
  expect(buf2.toString('hex')).toBe('05f5e100')
})
