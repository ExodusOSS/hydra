import assert from 'assert'
import { ethereum } from '../_fixtures.js'

test('should convert to a JavaScript number', () => {
  const _num = 12_134.078_582_082_819
  const actual = ethereum.ETH(_num).toNumber()
  const expected = 12_134.078_582_082_819
  assert.strictEqual(actual, expected)
})

test('should convert to correct unit #1', () => {
  const _num = 12_134.078_582_082_819
  const actual = ethereum.ETH(_num).toBase().toNumber('ETH')
  const expected = 12_134.078_582_082_819
  assert.strictEqual(actual, expected)
})

test('should convert to correct unit #2', () => {
  const _num = 12_134
  const actual = ethereum.wei(_num).toDefault().toNumber(ethereum.wei)
  const expected = 12_134
  assert.strictEqual(actual, expected)
})

test('should convert to correct unit #3', () => {
  const _num = 12_134.078_582_082
  const actual = ethereum.ETH(_num).toBase().toNumber()
  const expected = 1.213_407_858_208_2e22
  assert.strictEqual(actual, expected)
})

test('should work with caching', () => {
  const _num = 12_134.078_582_082
  const numberUnit = ethereum.ETH(_num).toBase()

  const actual = numberUnit.toNumber()
  const actual2 = numberUnit.toNumber()

  const expected = 1.213_407_858_208_2e22
  assert.strictEqual(actual, expected)
  assert.strictEqual(actual2, expected)
  assert.strictEqual(!!numberUnit._numberStringMap.get('wei'), true)
})
