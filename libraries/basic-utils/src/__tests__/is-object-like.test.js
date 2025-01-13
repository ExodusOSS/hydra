import { isObjectLike } from '../lodash.js'

describe('isObjectLike', function () {
  /* eslint-disable no-new-object */
  it('should return `true` for objects', function () {
    expect(isObjectLike([1, 2, 3])).toBe(true)
    expect(isObjectLike(new Object(false))).toBe(true)
    expect(isObjectLike(new Date())).toBe(true)
    expect(isObjectLike(new Error('hi'))).toBe(true)
    expect(isObjectLike({ a: 1 })).toBe(true)
    expect(isObjectLike(new Object(0))).toBe(true)
    expect(isObjectLike(/x/)).toBe(true)
    expect(isObjectLike(new Object('a'))).toBe(true)
  })

  it('should return `false` for non-objects', function () {
    expect(isObjectLike(false)).toBe(false)
    expect(isObjectLike(true)).toBe(false)
    expect(isObjectLike(1)).toBe(false)
    expect(isObjectLike('hi')).toBe(false)
  })
})
