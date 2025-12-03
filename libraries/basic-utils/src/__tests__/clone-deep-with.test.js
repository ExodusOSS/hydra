import cloneDeepWith from '../clone-deep-with.js'

// Mock NumberUnit-like objects for testing
const mockNumberUnit = (value) => ({
  _number: value,
  unit: 'BTC',
  unitType: 'bitcoin',
  baseUnit: 'satoshi',
  isNumberUnit: true,
  toString: () => `${value} BTC`,
})

const mockIsNumberUnit = (value) => {
  return value && typeof value === 'object' && value.isNumberUnit === true
}

describe('cloneDeepWith', () => {
  describe('primitives', () => {
    test('should return primitive values unchanged when handler returns undefined', () => {
      const handler = () => {}

      expect(cloneDeepWith(42, handler)).toBe(42)
      expect(cloneDeepWith('string', handler)).toBe('string')
      expect(cloneDeepWith(true, handler)).toBe(true)
      expect(cloneDeepWith(false, handler)).toBe(false)
      expect(cloneDeepWith(null, handler)).toBe(null)
      expect(cloneDeepWith(undefined, handler)).toBe(undefined)
    })

    test('should return handler result when handler returns defined value', () => {
      const handler = (value) => {
        if (typeof value === 'number') return value * 2
      }

      expect(cloneDeepWith(42, handler)).toBe(84)
      expect(cloneDeepWith('string', handler)).toBe('string')
    })
  })

  describe('objects', () => {
    test('should deep clone simple objects', () => {
      const obj = { a: 1, b: 2 }
      const handler = () => {}
      const result = cloneDeepWith(obj, handler)

      expect(result).toEqual(obj)
      expect(result).not.toBe(obj)
    })

    test('should deep clone nested objects', () => {
      const obj = { a: { b: { c: 1 } }, d: 2 }
      const handler = () => {}
      const result = cloneDeepWith(obj, handler)

      expect(result).toEqual(obj)
      expect(result).not.toBe(obj)
      expect(result.a).not.toBe(obj.a)
      expect(result.a.b).not.toBe(obj.a.b)
    })

    test('should preserve object prototype', () => {
      class TestClass {
        constructor(value) {
          this.value = value
        }
      }

      const obj = new TestClass(42)
      const handler = () => {}
      const result = cloneDeepWith(obj, handler)

      expect(result).toBeInstanceOf(TestClass)
      expect(result.value).toBe(42)
      expect(result).not.toBe(obj)
    })

    test('should handle objects with null prototype', () => {
      const obj = Object.create(null)
      obj.a = 1
      obj.b = 2

      const handler = () => {}
      const result = cloneDeepWith(obj, handler)

      expect(result).toEqual(obj)
      expect(result).not.toBe(obj)
      expect(Object.getPrototypeOf(result)).toBe(null)
    })
  })

  describe('arrays', () => {
    test('should deep clone arrays as arrays', () => {
      const arr = [1, 2, 3]
      const handler = () => {}
      const result = cloneDeepWith(arr, handler)

      expect(result).toEqual([1, 2, 3])
      expect(result).not.toBe(arr)
      expect(Array.isArray(result)).toBe(true)
    })

    test('should deep clone nested arrays', () => {
      const arr = [1, [2, [3, 4]], 5]
      const handler = () => {}
      const result = cloneDeepWith(arr, handler)

      expect(result).toEqual([1, [2, [3, 4]], 5])
      expect(result).not.toBe(arr)
      expect(result[1]).not.toBe(arr[1])
      expect(result[1][1]).not.toBe(arr[1][1])
    })

    test('should handle arrays with objects', () => {
      const arr = [{ a: 1 }, { b: 2 }]
      const handler = () => {}
      const result = cloneDeepWith(arr, handler)

      expect(result).toEqual([{ a: 1 }, { b: 2 }])
      expect(result).not.toBe(arr)
      expect(result[0]).not.toBe(arr[0])
      expect(result[1]).not.toBe(arr[1])
    })
  })

  describe('mixed structures', () => {
    test('should handle complex nested structures with arrays', () => {
      const complex = {
        string: 'hello',
        number: 42,
        array: [1, 2, { nested: 'value' }],
        object: {
          deep: {
            array: [{ a: 1 }, { b: 2 }],
          },
        },
      }

      const handler = () => {}
      const result = cloneDeepWith(complex, handler)

      const expected = {
        string: 'hello',
        number: 42,
        array: [1, 2, { nested: 'value' }],
        object: {
          deep: {
            array: [{ a: 1 }, { b: 2 }],
          },
        },
      }

      expect(result).toEqual(expected)
      expect(result).not.toBe(complex)
      expect(result.array).not.toBe(complex.array)
      expect(result.array[2]).not.toBe(complex.array[2])
      expect(result.object.deep.array[0]).not.toBe(complex.object.deep.array[0])
    })
  })

  describe('handler functionality', () => {
    test('should call handler for each value in nested structure', () => {
      const obj = { a: 1, b: { c: 2 } }
      const handler = jest.fn(() => {})

      cloneDeepWith(obj, handler)

      expect(handler).toHaveBeenCalledWith(obj)
      expect(handler).toHaveBeenCalledWith(1)
      expect(handler).toHaveBeenCalledWith(obj.b)
      expect(handler).toHaveBeenCalledWith(2)
    })

    test('should use handler result when defined', () => {
      const obj = { a: 1, b: { c: 2 } }
      const handler = (value) => {
        if (typeof value === 'number') return value * 10
      }

      const result = cloneDeepWith(obj, handler)

      expect(result).toEqual({ a: 10, b: { c: 20 } })
    })

    test('should not traverse into handler-returned values', () => {
      const obj = { a: { b: { c: 1 } } }
      const handler = (value) => {
        if (value && typeof value === 'object' && 'b' in value) {
          return { replaced: true }
        }
      }

      const result = cloneDeepWith(obj, handler)

      expect(result).toEqual({ a: { replaced: true } })
    })
  })

  describe('NumberUnit example', () => {
    test('should handle NumberUnit-like objects as specified in the example', () => {
      const balances = {
        BTC: mockNumberUnit(1.5),
        ETH: mockNumberUnit(2),
        nested: {
          USDC: mockNumberUnit(1000),
          regularValue: 'not a number unit',
        },
      }

      const handler = (value) => {
        if (mockIsNumberUnit(value)) {
          return value // return the NumberUnit as-is
        }
      }

      const result = cloneDeepWith(balances, handler)

      // NumberUnit objects should be the same reference (not cloned)
      expect(result.BTC).toBe(balances.BTC)
      expect(result.ETH).toBe(balances.ETH)
      expect(result.nested.USDC).toBe(balances.nested.USDC)

      // But the containing objects should be cloned
      expect(result).not.toBe(balances)
      expect(result.nested).not.toBe(balances.nested)

      // Non-NumberUnit values should still be cloned normally
      expect(result.nested.regularValue).toBe('not a number unit')
    })

    test('should work with actual isNumberUnit-like function pattern', () => {
      // Simulate a more realistic scenario
      const createBalances = () => ({
        wallet1: {
          BTC: mockNumberUnit(0.5),
          ETH: mockNumberUnit(1.2),
          metadata: { name: 'Primary Wallet' },
        },
        wallet2: {
          BTC: mockNumberUnit(0.3),
          LTC: mockNumberUnit(5),
          metadata: { name: 'Secondary Wallet' },
        },
      })

      const balances = createBalances()

      const result = cloneDeepWith(balances, (value) => {
        if (mockIsNumberUnit(value)) {
          return value
        }
      })

      // Structure should be preserved
      expect(Object.keys(result)).toEqual(['wallet1', 'wallet2'])
      expect(Object.keys(result.wallet1)).toEqual(['BTC', 'ETH', 'metadata'])

      // NumberUnits should be preserved by reference
      expect(result.wallet1.BTC).toBe(balances.wallet1.BTC)
      expect(result.wallet1.ETH).toBe(balances.wallet1.ETH)
      expect(result.wallet2.BTC).toBe(balances.wallet2.BTC)
      expect(result.wallet2.LTC).toBe(balances.wallet2.LTC)

      // But objects should be cloned
      expect(result.wallet1).not.toBe(balances.wallet1)
      expect(result.wallet2).not.toBe(balances.wallet2)
      expect(result.wallet1.metadata).not.toBe(balances.wallet1.metadata)

      // Regular values should be cloned normally
      expect(result.wallet1.metadata.name).toBe('Primary Wallet')
    })
  })

  describe('edge cases', () => {
    test('should handle empty objects', () => {
      const handler = () => {}
      const result = cloneDeepWith({}, handler)

      expect(result).toEqual({})
      expect(result).not.toBe({})
    })

    test('should handle empty arrays', () => {
      const handler = () => {}
      const result = cloneDeepWith([], handler)

      expect(result).toEqual([])
      expect(Array.isArray(result)).toBe(true)
    })

    test('should throw TypeError for Date objects', () => {
      const date = new Date('2023-01-01')
      const obj = { timestamp: date }
      const handler = () => {}

      expect(() => cloneDeepWith(obj, handler)).toThrow(TypeError)
      expect(() => cloneDeepWith(obj, handler)).toThrow('Cloning Date objects is not supported')
    })

    test('should throw TypeError for Map objects', () => {
      const map = new Map([['key', 'value']])
      const obj = { map }
      const handler = () => {}

      expect(() => cloneDeepWith(obj, handler)).toThrow(TypeError)
      expect(() => cloneDeepWith(obj, handler)).toThrow('Cloning Map objects is not supported')
    })

    test('should throw TypeError for Set objects', () => {
      const set = new Set([1, 2, 3])
      const obj = { set }
      const handler = () => {}

      expect(() => cloneDeepWith(obj, handler)).toThrow(TypeError)
      expect(() => cloneDeepWith(obj, handler)).toThrow('Cloning Set objects is not supported')
    })

    test('should handle functions in objects', () => {
      const fn = () => 'test'
      const obj = { method: fn, value: 42 }
      const handler = () => {}
      const result = cloneDeepWith(obj, handler)

      expect(result.method).toBe(fn)
      expect(result.value).toBe(42)
      expect(result).not.toBe(obj)
    })

    test('should fail on circular references (expected behavior)', () => {
      const obj = { a: 1 }
      obj.self = obj

      const handler = () => {}

      // This will throw a stack overflow as expected
      expect(() => cloneDeepWith(obj, handler)).toThrow('Maximum call stack size exceeded')
    })
  })
})
