import assert from 'assert'
import { ethereum } from '../_fixtures.js'

test('should convert to a JavaScript string #1', () => {
  const _num = 12_134.078_582_082_819
  const actual = ethereum.ETH(_num).toString({ unit: false })
  const expected = '12134.078582082819'
  assert.strictEqual(actual, expected)
})

test('should convert to a JavaScript string #2', () => {
  const _num = 12_134.078_582_082
  const actual = ethereum.ETH(_num).toString()
  const expected = '12134.078582082 ETH'
  assert.strictEqual(actual, expected)
})

test('should convert to a JavaScript string #3', () => {
  const _num = 12_134.078_582_082
  const actual = ethereum.ETH(_num).toBase().toString()
  const expected = '12134078582082000000000 wei'
  assert.strictEqual(actual, expected)
})

test('should convert to correct unit #1', () => {
  const _num = 12_134.078_582_082_819
  const actual = ethereum.ETH(_num).toBase().toString({
    unit: false,
    unitInstance: ethereum.ETH,
  })
  const expected = '12134.078582082819'
  assert.strictEqual(actual, expected)
})

test('should convert to correct unit #2', () => {
  const _num = 12_134
  const actual = ethereum
    .wei(_num)
    .toDefault()
    .toString({ unit: false, unitInstance: ethereum.wei })
  const expected = '12134'
  assert.strictEqual(actual, expected)
})

test('should convert to correct unit #3', () => {
  const _num = 12_134.078_582_082
  const actual = ethereum.ETH(_num).toBase().toString({ unit: false })
  const expected = '12134078582082000000000'
  assert.strictEqual(actual, expected)
})

test('should work with caching', () => {
  const _num = 12_134.078_582_082
  const numberUnit = ethereum.ETH(_num).toBase()

  const actual = numberUnit.toString({ unit: false })
  const actual2 = numberUnit.toString({ unit: false })

  const expected = '12134078582082000000000'
  assert.strictEqual(actual, expected)
  assert.strictEqual(actual2, expected)
  assert.strictEqual(!!numberUnit._numberStringMap.get('wei'), true)
})
