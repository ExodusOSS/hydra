import { bitcoin, ethereum } from '../_fixtures.js'
import assert from 'assert'

test('mul() should return the product', function () {
  expect(bitcoin.BTC(3).mul(2).toString()).toBe('6 BTC')

  expect(bitcoin.BTC(-3).mul(2).toString()).toBe('-6 BTC')

  expect(bitcoin.BTC(3).mul(-2).toString()).toBe('-6 BTC')

  expect(bitcoin.BTC(-3).mul(-2).toString()).toBe('6 BTC')

  expect(bitcoin.BTC(1.5).mul(2).toString()).toBe('3 BTC')

  expect(bitcoin.BTC(0.1).mul(0.2).toString()).toBe('0.02 BTC')

  assert.strictEqual(bitcoin.BTC(-3).mul(2).toString(), '-6 BTC')
})

test('mul() should handle scientific notation', () => {
  const noDecimal = [1e23, '1e+23']
  noDecimal.forEach((v) =>
    assert.strictEqual(ethereum.wei(2).mul(v).toDefaultString({ unit: true }), '200000 ETH', v)
  )

  const noDecimalNegative = [-1e23, '-1e+23']
  noDecimalNegative.forEach((v) =>
    assert.strictEqual(ethereum.wei(2).mul(v).toDefaultString({ unit: true }), '-200000 ETH', v)
  )

  const noDecimalFraction = [1e-16, '1e-16']
  noDecimalFraction.forEach((v) =>
    assert.strictEqual(ethereum.ETH(2).mul(v).toBaseString({ unit: true }), '200 wei', v)
  )

  const noDecimalFractionNegative = [-1e-16, '-1e-16']
  noDecimalFractionNegative.forEach((v) =>
    assert.strictEqual(ethereum.ETH(2).mul(v).toBaseString({ unit: true }), '-200 wei', v)
  )

  const decimal = [1.23e23, '1.23e+23']
  decimal.forEach((v) =>
    assert.strictEqual(ethereum.wei(2).mul(v).toDefaultString({ unit: true }), '246000 ETH', v)
  )

  const decimalNegative = [-1.23e23, '-1.23e+23']
  decimalNegative.forEach((v) =>
    assert.strictEqual(ethereum.wei(2).mul(v).toDefaultString({ unit: true }), '-246000 ETH', v)
  )

  const decimalFraction = [1.23e-16, '1.23e-16']
  decimalFraction.forEach((v) =>
    assert.strictEqual(ethereum.ETH(2).mul(v).toBaseString({ unit: true }), '246 wei', v)
  )

  const decimalFractionNegative = [-1.23e-16, '-1.23e-16']
  decimalFractionNegative.forEach((v) =>
    assert.strictEqual(ethereum.ETH(2).mul(v).toBaseString({ unit: true }), '-246 wei', v)
  )
})

test('mul() should handle leading 0s', () => {
  const decimal = ['000.123', '000123e-3']
  decimal.forEach((v) => assert.strictEqual(bitcoin.BTC(2).mul(v).toString(), '0.246 BTC', v))

  const noDecimal = ['000123', '00012300e-2', '0001.23e+2']
  noDecimal.forEach((v) => assert.strictEqual(bitcoin.BTC(2).mul(v).toString(), '246 BTC', v))
})

test('mul() should handle trailing 0s', () => {
  const decimal = ['123.4560000', '1.234560000e+2', '12345.60000e-2']
  decimal.forEach((v) => assert.strictEqual(bitcoin.BTC(2).mul(v).toString(), '246.912 BTC', v))
})

test('mul() does not support NumberUnit as argument', () => {
  assert.throws(() => ethereum.wei(100).mul(ethereum.wei(1)), 'multiply by NumberUnit throws')
})
