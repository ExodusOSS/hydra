import { deepPick } from '../deep.js'

const assertType = <T>(value: T): T => value

describe('deepPick', function () {
  const object = { a: 1, b: 2, c: 3, d: 4 }

  const nested = { a: 1, b: { c: 2, d: 3 } }

  it('should require an Array of keys', function () {
    expect(() => deepPick(object, undefined as any)).toThrow(/Array/iu)
    expect(() => deepPick(object, 'a' as any)).toThrow(/Array/iu)
    expect(() => (deepPick as any)(object, 'a', 'b')).toThrow(/Array/iu)
  })

  it('should throw on non-objects', function () {
    expect(() => deepPick('' as any, [['slice']])).toThrow(/Object/iu)
    expect(() => deepPick({ a: [] }, [['a', 'length']])).toThrow(/Object/iu)
    expect(() => deepPick({ foo() {} }, [['foo', 'name']])).toThrow(/Object/iu)
  })

  it('should pick provided keys', function () {
    expect(deepPick(object, [['a']])).toEqual({ a: object.a })
    expect(deepPick(object, [['a'], ['b']])).toEqual({ a: object.a, b: object.b })
  })

  test('picks paths from an object', () => {
    expect(deepPick(nested, [['a'], ['b', 'c']])).toEqual({ a: 1, b: { c: 2 } })
  })

  test('ignores missing paths', () => {
    expect(
      deepPick(nested, [
        ['b', 'c'],
        ['x', 'y'],
      ])
    ).toEqual({ b: { c: 2 } })
  })

  test('returns an empty object if no valid paths are given', () => {
    expect(deepPick(nested, [['x', 'y'], ['z']])).toEqual({})
  })

  test('supports array paths', () => {
    expect(deepPick(nested, [['a'], ['b', 'c']])).toEqual({ a: 1, b: { c: 2 } })
  })

  test('does not mutate original object', () => {
    const deep = {
      foo: {
        get a() {
          return 32
        },
        set a(_arg: any) {
          throw new Error('called a setter')
        },
      },
    }

    expect(() => deepPick(deep, [['foo'], ['foo', 'a']])).toThrow(/paths/iu)
  })

  describe('Type inference tests', () => {
    test('infers correct type for single path', () => {
      const obj = { a: 1, b: 'hello', c: true }
      const result = deepPick(obj, [['a']] as const)

      // Type assertion - result should have type Pick<typeof obj, 'a'>
      type Expected = { a: number }
      assertType<Expected>(result)

      // Runtime assertion
      expect(result).toEqual({ a: 1 })
    })

    test('infers correct type for multiple paths', () => {
      const obj = { a: 1, b: 'hello', c: true, d: null }
      const result = deepPick(obj, [['a'], ['b']] as const)

      // Type assertion - result should contain picked properties
      type Expected = { a: number; b: string }
      assertType<Expected>(result)

      expect(result).toEqual({ a: 1, b: 'hello' })
    })

    test('infers correct type for nested paths', () => {
      const obj = {
        user: {
          name: 'John',
          age: 30,
          address: {
            city: 'NYC',
            zip: '10001',
          },
        },
        meta: {
          created: '2024-01-01',
          updated: '2024-01-02',
        },
      }

      const result = deepPick(obj, [
        ['user', 'name'],
        ['user', 'address', 'city'],
      ] as const)

      // Type assertion - should preserve nested structure
      type Expected = { user: { name: string; address: { city: string } } }
      assertType<Expected>(result)

      expect(result).toEqual({ user: { name: 'John', address: { city: 'NYC' } } })
    })

    test('handles mixed depth paths correctly', () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
            f: 4,
          },
        },
        g: 'test',
      }

      const result = deepPick(obj, [['a'], ['b', 'c'], ['b', 'd', 'e'], ['g']] as const)

      // Type assertion - mixed depths should all work
      type Expected = {
        a: number
        b: {
          c: number
          d: { e: number }
        }
        g: string
      }
      assertType<Expected>(result)

      expect(result).toEqual({ a: 1, b: { c: 2, d: { e: 3 } }, g: 'test' })
    })

    test('returns PlainObject type for dynamic paths', () => {
      const obj = { a: 1, b: { c: 2 } }
      const paths: readonly (readonly string[])[] = [['a'], ['b', 'c']]
      const result = deepPick(obj, paths)

      // Type assertion - dynamic paths should fallback to PlainObject
      type Expected = Record<string, unknown>
      assertType<Expected>(result)

      expect(result).toEqual({ a: 1, b: { c: 2 } })
    })

    test('handles empty result type for invalid paths', () => {
      const obj = { a: 1, b: 2 }
      // Testing with non-existent keys - type system allows this, returns empty object
      const result = deepPick(obj, [['x'], ['y']] as const)

      // Type should be Record<string, never> for non-existent paths (empty object)
      type Expected = Record<string, never>
      assertType<Expected>(result)

      expect(result).toEqual({})
    })

    test('preserves literal types when using as const', () => {
      const obj = {
        status: 'active' as const,
        count: 5 as const,
        flags: {
          enabled: true as const,
          mode: 'production' as const,
        },
      }

      const result = deepPick(obj, [['status'], ['flags', 'mode']] as const)

      // Type assertion - literal types should be preserved
      type Expected = { status: 'active'; flags: { mode: 'production' } }
      assertType<Expected>(result)

      expect(result).toEqual({ status: 'active', flags: { mode: 'production' } })
    })

    test('handles union types in object properties', () => {
      const obj: { a: string | number; b: { c: boolean | null } } = {
        a: 'test',
        b: { c: true },
      }

      const result = deepPick(obj, [['a'], ['b', 'c']] as const)

      // Type assertion - union types should be preserved
      type Expected = { a: string | number; b: { c: boolean | null } }
      assertType<Expected>(result)

      expect(result).toEqual({ a: 'test', b: { c: true } })
    })
  })
})
