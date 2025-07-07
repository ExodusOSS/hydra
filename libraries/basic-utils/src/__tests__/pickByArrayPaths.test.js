import { pickByArrayPaths } from '../pick-by-array-paths.js'

describe('pickByArrayPaths', function () {
  const object = { a: 1, b: 2, c: 3, d: 4 }

  const nested = { a: 1, b: { c: 2, d: 3 } }

  it('should require an Array of keys', function () {
    expect(() => pickByArrayPaths(object)).toThrow(/Array/)
    expect(() => pickByArrayPaths(object, 'a')).toThrow(/Array/)
    expect(() => pickByArrayPaths(object, 'a', 'b')).toThrow(/Array/)
  })

  it('should pick provided keys', function () {
    expect(pickByArrayPaths(object, ['a'])).toEqual({ a: object.a })
    expect(pickByArrayPaths(object, ['a', 'b'])).toEqual({ a: object.a, b: object.b })
  })

  it('should return an empty object when `object` is nullish', function () {
    expect(pickByArrayPaths(null, ['a'])).toEqual(Object.create(null))
    expect(pickByArrayPaths(undefined, ['a'])).toEqual(Object.create(null))
  })

  it('should ignore prototype properties', function () {
    expect(pickByArrayPaths('', ['slice'])).toEqual(Object.create(null))
  })

  test('picks paths from an object', () => {
    expect(pickByArrayPaths(nested, ['a', ['b', 'c']])).toEqual({ a: 1, b: { c: 2 } })
  })

  test('ignores missing paths', () => {
    expect(
      pickByArrayPaths(nested, [
        ['b', 'c'],
        ['x', 'y'],
      ])
    ).toEqual({ b: { c: 2 } })
  })

  test('returns an empty object if no valid paths are given', () => {
    expect(pickByArrayPaths(nested, [['x', 'y'], 'z'])).toEqual(Object.create(null))
  })

  test('supports array paths', () => {
    expect(pickByArrayPaths(nested, [['a'], ['b', 'c']])).toEqual({ a: 1, b: { c: 2 } })
  })
})
