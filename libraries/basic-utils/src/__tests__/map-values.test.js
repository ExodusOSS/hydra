// adapted from https://github.com/lodash/lodash/blob/master/test/mapValues.js

import { mapValues } from '../lodash.js'

const identity = (val) => val

describe('mapValues', function () {
  const array = [1, 2]

  const object = { a: 1, b: 2 }

  it('should map values in `object` to a new object', function () {
    const actual = mapValues(object, String)
    expect(actual).toEqual({ a: '1', b: '2' })
  })

  it('should treat arrays like objects', function () {
    const actual = mapValues(array, String)
    expect(actual).toEqual({ 0: '1', 1: '2' })
  })

  it('should require iteratee to be a function', function () {
    expect(() => mapValues({}, 'a')).toThrow(/Function/)
  })

  it('should return empty object when iteratee is nullish', function () {
    expect(mapValues(null, identity)).toEqual({})
    expect(mapValues(undefined, identity)).toEqual({})
  })
})
