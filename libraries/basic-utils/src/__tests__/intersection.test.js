import { intersection } from '../lodash.js'

describe('intersection', function () {
  it('should validate inputs', function () {
    expect(() => intersection(1)).toThrow(/Array/)
    expect(() => intersection([], 1)).toThrow(/Array/)
  })

  it('should find the elements present in both arrays', function () {
    expect(intersection([], [])).toEqual([])
    expect(intersection([], [1, 2, 3])).toEqual([])
    expect(intersection([1, 2, 3], [])).toEqual([])
    expect(intersection([1, 2, 3], [2])).toEqual([2])
  })
})
