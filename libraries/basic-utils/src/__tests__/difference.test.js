import { difference } from '../lodash.js'

describe('difference', function () {
  it('should validate inputs', function () {
    expect(() => difference(1)).toThrow(/Array/)
    expect(() => difference([], 1)).toThrow(/Array/)
  })

  it('should find the elements present in the 1st array that are not present in the 2nd', function () {
    expect(difference([], [])).toEqual([])
    expect(difference([], [1, 2, 3])).toEqual([])
    expect(difference([1, 2, 3], [])).toEqual([1, 2, 3])
    expect(difference([1, 2, 3], [2])).toEqual([1, 3])
  })
})
