// adapted from https://github.com/lodash/lodash/blob/master/test/mapKeys.js

import { mapKeys } from '../lodash.js'

const identity = (val) => val

describe('mapKeys', function () {
  const array = [1, 2]

  const object = { a: 1, b: 2 }

  it('should map keys in `object` to a new object', function () {
    const actual = mapKeys(object, String)
    expect(actual).toEqual({ 1: 1, 2: 2 })
  })

  it('should treat arrays like objects', function () {
    const actual = mapKeys(array, String)
    expect(actual).toEqual({ 1: 1, 2: 2 })
  })

  it('should require iteratee to be a function', function () {
    expect(() => mapKeys({}, 'a')).toThrow(/Function/)
  })

  it('should return empty object when iteratee is nullish', function () {
    expect(mapKeys(null, identity)).toEqual({})
    expect(mapKeys(undefined, identity)).toEqual({})
  })
})
