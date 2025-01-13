// adapted from https://github.com/lodash/lodash/blob/master/test/pick.js

import { pick } from '../lodash.js'

describe('pick', function () {
  const object = { a: 1, b: 2, c: 3, d: 4 }

  const nested = { a: 1, b: { c: 2, d: 3 } }

  it('should require an Array of keys', function () {
    expect(() => pick(object)).toThrow(/Array/)
    expect(() => pick(object, 'a')).toThrow(/Array/)
    expect(() => pick(object, 'a', 'b')).toThrow(/Array/)
  })

  it('should pick provided keys', function () {
    expect(pick(object, ['a'])).toEqual({ a: object.a })
    expect(pick(object, ['a', 'b'])).toEqual({ a: object.a, b: object.b })
  })

  it('should NOT support deep paths', function () {
    expect(pick(nested, ['b.c'])).toEqual({})
  })

  it('should support keys with the . character', function () {
    const object = { 'a.b': 1, a: { b: 2 } }
    expect(pick(object, ['a.b'])).toEqual({ 'a.b': 1 })
  })

  it('should return an empty object when `object` is nullish', function () {
    expect(pick(null, ['a'])).toEqual({})
    expect(pick(undefined, ['a'])).toEqual({})
  })

  it('should ignore prototype properties', function () {
    expect(pick('', ['slice'])).toEqual({})
  })
})
