import { bitcoin, ethereum } from './_fixtures'

test('to() other units', function() {
  let b1 = bitcoin.BTC(1.53)

  let b2 = b1.to(bitcoin.bits)
  let b3 = b1.to('bits')

  expect(b2.toString()).toBe('1530000 bits')
  expect(b3.toString()).toBe('1530000 bits')
})

test('to() when undefined or null passed', function() {
  let b1 = bitcoin.BTC(1.53)

  expect(() => b1.to(null)).toThrow()
})

test('to() with conversionUnit undefined or null passed', function() {
  let b1 = bitcoin.BTC(1.53)

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
      .toDefault()
      .toString()
  ).toBe('229.5 ETH')

  expect(
    b1
      .to(ethereum.ETH, {
        from: bitcoin.BTC,
        fromUnit: 'satoshis',
        fromValue: 0.5,
        to: ethereum.ETH,
        toUnit: 'wei',
        toValue: 10000000000,
      })
      .toDefault()
      .toString()
  ).toBe('3.06 ETH')
})

test('toString() with unit parameter', function() {
  let b1 = bitcoin.BTC(1.53)

  expect(b1.toString()).toBe('1.53 BTC')
  expect(b1.toString({ unit: false })).toBe('1.53')
  expect(b1.toString({ unit: true })).toBe('1.53 BTC')
})

test('toString() with format parameter', function() {
  let b1 = bitcoin.BTC(1.53)

  expect(b1.toString({ format: (value, unit) => unit + ' ' + value })).toBe('BTC 1.53')
})

test('toNumber()', function() {
  let b1 = bitcoin.BTC(1.53)

  expect(b1.toNumber()).toBe(1.53)
  expect(b1.to('bits').toNumber()).toBe(1530000)
})
