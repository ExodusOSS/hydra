import assert from 'assert'
import NumberUnit from '../../index.js'
import { bitcoin, ethereum } from '../_fixtures.js'

test('factory create method with number input', function () {
  // very verbose
  const amount1 = NumberUnit.create(1.53, bitcoin.BTC)
  expect(amount1.unitName).toBe('BTC')
  expect(amount1.toNumber()).toBe(1.53)

  // more concise
  const amount2 = bitcoin.BTC(1.53)
  expect(amount2.unitName).toBe('BTC')
  expect(amount2.toNumber()).toBe(1.53)
})

test('create method with string input', function () {
  // more concise
  const amount2 = bitcoin.BTC('1.53')
  expect(amount2.unitName).toBe('BTC')
  expect(amount2.toNumber()).toBe(1.53)
})

test('create method with NumberUnit input', function () {
  expect.assertions(2)

  const amount2 = bitcoin.BTC('1.53')
  expect(amount2.toString()).toBe('1.53 BTC')

  const amount3 = bitcoin.bits(amount2)
  expect(amount3.toString()).toBe('1530000 bits')
})

test('large numbers > 15 significant digits', () => {
  const num1 = 12_134.078_582_082_819
  const eth1 = NumberUnit.create(num1, ethereum.ETH)
  assert.strictEqual(eth1.toString({ unit: false }), String(num1))

  const num2 = String(num1)
  const eth2 = NumberUnit.create(num2, ethereum.ETH)
  assert.strictEqual(eth2.toString({ unit: false }), String(num2))
})

test('should convert hex numbers', () => {
  const actual = String(ethereum.wei('0x5127a0944eb5800').to('ETH'))
  const expected = '0.3654887 ETH'
  assert.strictEqual(actual, expected)
})

test('should convert capitalized hex numbers', () => {
  const actual = String(ethereum.wei('0x5127A0944EB5800').to('ETH'))
  const expected = '0.3654887 ETH'
  assert.strictEqual(actual, expected)
})

test('should not convert hex numbers without 0x prefix', () => {
  assert.throws(() => {
    String(ethereum.wei('5127a0944eb5800').to('ETH'))
  })
})

test('should handle scientific notation', () => {
  const noDecimal = [1e23, '1e+23']
  noDecimal.forEach((v) =>
    assert.strictEqual(ethereum.wei(v).toDefaultString({ unit: true }), '100000 ETH', v)
  )

  const noDecimalNegative = [-1e23, '-1e+23']
  noDecimalNegative.forEach((v) =>
    assert.strictEqual(ethereum.wei(v).toDefaultString({ unit: true }), '-100000 ETH', v)
  )

  const noDecimalFraction = [1e-16, '1e-16']
  noDecimalFraction.forEach((v) =>
    assert.strictEqual(ethereum.ETH(v).toBaseString({ unit: true }), '100 wei', v)
  )

  const noDecimalFractionNegative = [-1e-16, '-1e-16']
  noDecimalFractionNegative.forEach((v) =>
    assert.strictEqual(ethereum.ETH(v).toBaseString({ unit: true }), '-100 wei', v)
  )

  const decimal = [1.23e23, '1.23e+23']
  decimal.forEach((v) =>
    assert.strictEqual(ethereum.wei(v).toDefaultString({ unit: true }), '123000 ETH', v)
  )

  const decimalNegative = [-1.23e23, '-1.23e+23']
  decimalNegative.forEach((v) =>
    assert.strictEqual(ethereum.wei(v).toDefaultString({ unit: true }), '-123000 ETH', v)
  )

  const decimalFraction = [1.23e-16, '1.23e-16']
  decimalFraction.forEach((v) =>
    assert.strictEqual(ethereum.ETH(v).toBaseString({ unit: true }), '123 wei', v)
  )

  const decimalFractionNegative = [-1.23e-16, '-1.23e-16']
  decimalFractionNegative.forEach((v) =>
    assert.strictEqual(ethereum.ETH(v).toBaseString({ unit: true }), '-123 wei', v)
  )
})

test('should handle leading 0s', () => {
  const decimal = ['000.123', '000123e-3']
  decimal.forEach((v) => assert.strictEqual(bitcoin.BTC(v).toString(), '0.123 BTC', v))

  const noDecimal = ['000123', '00012300e-2', '0001.23e+2']
  noDecimal.forEach((v) => assert.strictEqual(bitcoin.BTC(v).toString(), '123 BTC', v))
})

test('should handle trailing 0s', () => {
  const decimal = ['123.4560000', '1.234560000e+2', '12345.60000e-2']
  decimal.forEach((v) => assert.strictEqual(bitcoin.BTC(v).toString(), '123.456 BTC', v))
})
