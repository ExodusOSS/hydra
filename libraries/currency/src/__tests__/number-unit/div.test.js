import assert from 'assert'

import { bitcoin, ethereum } from '../_fixtures.js'

test('div() should return the division', function () {
  expect(bitcoin.BTC(3).div(2).toString()).toBe('1.5 BTC')

  expect(bitcoin.BTC(-3).div(2).toString()).toBe('-1.5 BTC')

  expect(bitcoin.BTC(3).div(-2).toString()).toBe('-1.5 BTC')

  expect(bitcoin.BTC(-3).div(-2).toString()).toBe('1.5 BTC')

  expect(bitcoin.BTC(1.5).div(2).toString()).toBe('0.75 BTC')

  expect(bitcoin.BTC(0.1).div(0.2).toString()).toBe('0.5 BTC')

  assert.strictEqual(bitcoin.BTC(-3).div(2).toString(), '-1.5 BTC')
})

test('div() should handle scientific notation', () => {
  const noDecimal = [1e23, '1e+23']
  noDecimal.forEach((v) =>
    assert.strictEqual(ethereum.ETH(200_000).div(v).toBaseString({ unit: true }), '2 wei', v)
  )

  const noDecimalNegative = [-1e23, '-1e+23']
  noDecimalNegative.forEach((v) =>
    assert.strictEqual(ethereum.ETH(200_000).div(v).toBaseString({ unit: true }), '-2 wei', v)
  )

  const noDecimalFraction = [1e-16, '1e-16']
  noDecimalFraction.forEach((v) =>
    assert.strictEqual(ethereum.wei(200).div(v).toDefaultString({ unit: true }), '2 ETH', v)
  )

  const noDecimalFractionNegative = [-1e-16, '-1e-16']
  noDecimalFractionNegative.forEach((v) =>
    assert.strictEqual(ethereum.wei(2).div(v).toDefaultString({ unit: true }), '-0.02 ETH', v)
  )

  const decimal = [1.23e23, '1.23e+23']
  decimal.forEach((v) =>
    assert.strictEqual(ethereum.ETH(2_000_000).div(v).toBaseString({ unit: true }), '16 wei', v)
  )

  const decimalNegative = [-1.23e23, '-1.23e+23']
  decimalNegative.forEach((v) =>
    assert.strictEqual(ethereum.ETH(246_000).div(v).toBaseString({ unit: true }), '-2 wei', v)
  )

  const decimalFraction = [1.23e-16, '1.23e-16']
  decimalFraction.forEach((v) =>
    assert.strictEqual(ethereum.wei(246).div(v).toDefaultString({ unit: true }), '2 ETH', v)
  )

  const decimalFractionNegative = [-1.23e-16, '-1.23e-16']
  decimalFractionNegative.forEach((v) =>
    assert.strictEqual(ethereum.wei(246).div(v).toDefaultString({ unit: true }), '-2 ETH', v)
  )
})

test('div() should handle leading 0s', () => {
  const decimal = ['000.123', '000123e-3']
  decimal.forEach((v) => assert.strictEqual(bitcoin.BTC(2).div(v).toString(), '16.2601626 BTC', v))

  const noDecimal = ['000123', '00012300e-2', '0001.23e+2']
  noDecimal.forEach((v) =>
    assert.strictEqual(bitcoin.BTC(2).div(v).toString(), '0.01626016 BTC', v)
  )
})

test('div() should handle trailing 0s', () => {
  const decimal = ['123.4560000', '1.234560000e+2', '12345.60000e-2']
  decimal.forEach((v) => assert.strictEqual(bitcoin.BTC(2).div(v).toString(), '0.0162001 BTC', v))
})

test('div() should clip at base trailing 0s', () => {
  assert.strictEqual(ethereum.wei(100).div(1000).toString(), '0 wei')
})

test('div() divide by 0 should throw', () => {
  assert.throws(() => ethereum.wei(100).div(0).toString(), 'division by 0 throws')

  assert.throws(() => ethereum.wei(100).div('0.00').toString(), 'division by 0 throws')
})

test('div() does not support NumberUnit as argument', () => {
  assert.throws(() => ethereum.wei(100).div(ethereum.wei(1)), 'division by NumberUnit throws')
})
