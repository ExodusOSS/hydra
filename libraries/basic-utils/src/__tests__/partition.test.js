// adapted from https://github.com/lodash/lodash/blob/master/test/partition.js

import { partition } from '../lodash.js'

const identity = (val) => val
const stubTrue = () => true
const stubFalse = () => false

describe('partition', function () {
  const array = [1, 0, 1]

  it('should validate inputs', function () {
    expect(() => partition(1)).toThrow(/Array/)
    expect(() => partition([], 1)).toThrow(/Function/)
  })

  it('should split elements into two groups by `predicate`', function () {
    expect(partition([], identity)).toEqual([[], []])
    expect(partition(array, stubTrue)).toEqual([array, []])
    expect(partition(array, stubFalse)).toEqual([[], array])
    expect(partition(array, (el) => el === 1)).toEqual([[1, 1], [0]])
  })
})
