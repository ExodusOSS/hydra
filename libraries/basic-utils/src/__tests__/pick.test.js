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

  it('should return an empty object when `object` is nullish', function () {
    expect(pick(null, ['a'])).toEqual(Object.create(null))
    expect(pick(undefined, ['a'])).toEqual(Object.create(null))
  })

  it('should ignore prototype properties', function () {
    expect(pick('', ['slice'])).toEqual(Object.create(null))
  })

  test('picks paths from an object', () => {
    expect(pick(nested, ['a', 'b.c'])).toEqual({ a: 1, b: { c: 2 } })
  })

  test('ignores missing paths', () => {
    expect(pick(nested, ['b.c', 'x.y'])).toEqual({ b: { c: 2 } })
  })

  test('returns an empty object if no valid paths are given', () => {
    expect(pick(nested, ['x.y', 'z'])).toEqual(Object.create(null))
  })

  test('supports array paths', () => {
    expect(pick(nested, [['a'], ['b', 'c']])).toEqual({ a: 1, b: { c: 2 } })
  })
})
