// adapted from https://github.com/lodash/lodash/blob/master/test/pickBy.test.js

import { pickBy } from '../lodash.js'

describe('pickBy', function () {
  it('should work with a predicate argument', function () {
    const object = { a: 1, b: 2, c: 3, d: 4 }

    const actual = pickBy(object, (n) => {
      return n === 1 || n === 3
    })

    expect(actual).toEqual({ a: 1, c: 3 })
  })

  it('should not treat keys with dots as deep paths', function () {
    const object = { 'a.b.c': 1 }
    const actual = pickBy(object, () => true)

    expect(actual).toEqual({ 'a.b.c': 1 })
  })

  it('should allow filtering based on key', () => {
    const object = { a: 1, b: 2, c: 3, d: 4 }

    const actual = pickBy(object, (v, k) => {
      return ['a', 'c'].includes(k)
    })

    expect(actual).toEqual({
      a: 1,
      c: 3,
    })
  })
})
