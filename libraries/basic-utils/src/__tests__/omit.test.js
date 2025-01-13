import { omit } from '../lodash.js'

describe('omit', function () {
  const object = { a: 1, b: 2, c: 3, d: 4 }

  const nested = { a: 1, b: { c: 2, d: 3 } }

  it('should require an Array of keys', function () {
    expect(() => omit(object)).toThrow(/Array/)
    expect(() => omit(object, 'a')).toThrow(/Array/)
    expect(() => omit(object, 'a', 'b')).toThrow(/Array/)
  })

  it('should omit provided keys', function () {
    expect(omit(object, ['a', 'b', 'c'])).toEqual({ d: object.d })
    expect(omit(object, ['a', 'b'])).toEqual({ c: object.c, d: object.d })
  })

  it('should NOT support deep paths', function () {
    expect(omit(nested, ['b.c'])).toEqual(nested)
  })

  it('should support keys with the . character', function () {
    const object = { 'a.b': 1, a: { b: 2 } }
    expect(omit(object, ['a.b'])).toEqual({ a: { b: 2 } })
  })

  it('should return an empty object when `object` is nullish', function () {
    expect(omit(null, ['a'])).toEqual({})
    expect(omit(undefined, ['a'])).toEqual({})
  })

  it('should ignore prototype properties', function () {
    expect(omit('', ['nonStringProp'])).toEqual({})
  })

  it('should not mutate `object`', function () {
    ;[['a'], ['a.b']].forEach((path) => {
      const object = { a: { b: 2 } }
      omit(object, path)
      expect(object).toEqual({ a: { b: 2 } })
    })
  })
})
