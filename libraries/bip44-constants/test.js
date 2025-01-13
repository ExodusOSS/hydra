const bip44Constants = require('./index')
const bit44ConstantByTickerMap = require('./by-ticker')

const unique = (array) => {
  return ([...new Set(array)].sort())
}

const assert = (value, message) => {
  if (!value) {
    throw new Error(message)
  }
}

const assertSameArray = (arr1, arr2) => {
  const difference1 = arr1.filter(x => !arr2.includes(x))

  if (difference1.length) {
    throw new Error('arr1 does not include ' + difference1)
  }

  const difference2 = arr2.filter(x => !arr1.includes(x))

  if (difference2.length) {
    throw new Error('arr2 does not include ' + difference2)
  }
}

const mapKeys = unique((Object.keys(bit44ConstantByTickerMap)))
const arrayKeys = unique(bip44Constants.map(array => array[1]))
assertSameArray(mapKeys, arrayKeys)

const mapSize = Object.keys(bit44ConstantByTickerMap).length
const expectedSize = 1002
if (mapSize !== expectedSize) {
  throw new Error(`Expected size is ${expectedSize} but got ${mapSize}`)
}

assert(bit44ConstantByTickerMap.NANO === 0x80000100, 'Invalid NANO')
assert(bit44ConstantByTickerMap.HBAR === 0x80000bd6, 'Invalid HBAR')
assert(bit44ConstantByTickerMap.FLR === 0x8000022a, 'Invalid FLR')
assert(bit44ConstantByTickerMap.EGLD === 0x800001fc, 'Invalid EGLD')

console.log('Test OK!')
