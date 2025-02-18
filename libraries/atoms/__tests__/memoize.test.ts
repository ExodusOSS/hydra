import type { ModelLike } from '../src/utils/memoize.js'
import { safeMemoize } from '../src/utils/memoize.js'

describe('safeMemoize', () => {
  it('works with primitive numbers', () => {
    const mockFn = jest.fn((x: number) => x * 2)
    const memoizedFn = safeMemoize(mockFn)

    expect(memoizedFn(5)).toBe(10)
    expect(memoizedFn(5)).toBe(10)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('works with primitive strings', () => {
    const mockFn = jest.fn((str: string) => str.toUpperCase())
    const memoizedFn = safeMemoize(mockFn)

    expect(memoizedFn('hello')).toBe('HELLO')
    expect(memoizedFn('hello')).toBe('HELLO')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('works with null and undefined', () => {
    const mockFn = jest.fn((x: null | undefined) => x)
    const memoizedFn = safeMemoize(mockFn)

    expect(memoizedFn(null)).toBe(null)
    expect(memoizedFn(undefined)).toBe(undefined)
    expect(memoizedFn(null)).toBe(null)
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('works with null and undefined as nested properties', () => {
    const mockFn = jest.fn((_obj: Record<string, string | undefined | null>) => {
      return 'empty'
    })

    const memoizedFn = safeMemoize(mockFn)

    const obj1 = { a: undefined, b: undefined }
    const obj2 = { a: null, b: null }
    const obj3 = { a: null, b: undefined }
    const obj4 = { a: undefined, b: null }

    expect(memoizedFn(obj1)).toBe('empty')
    expect(memoizedFn(obj2)).toBe('empty')
    expect(memoizedFn(obj3)).toBe('empty')
    expect(memoizedFn(obj4)).toBe('empty')

    expect(mockFn).toHaveBeenCalledTimes(4)
  })

  it('handles circular references', () => {
    const mockFn = jest.fn((obj: any) => {
      return Object.keys(obj).length
    })
    const memoizedFn = safeMemoize(mockFn)

    const obj1: any = { x: 1 }
    const obj2: any = { y: 2 }

    obj1.ref = obj2
    obj2.ref = obj1

    // Another pair of mutually circular references with same structure
    const obj3: any = { x: 1 }
    const obj4: any = { y: 2 }
    obj3.ref = obj4
    obj4.ref = obj3

    expect(memoizedFn(obj1)).toBe(2)
    expect(memoizedFn(obj3)).toBe(2)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('works with simple objects', () => {
    const mockFn = jest.fn((obj: { x: number }) => obj.x * 2)
    const memoizedFn = safeMemoize(mockFn)

    const obj1 = { x: 5 }
    const obj2 = { x: 5 }

    expect(memoizedFn(obj1)).toBe(10)
    expect(memoizedFn(obj2)).toBe(10)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('works with nested objects', () => {
    const mockFn = jest.fn((obj: { a: { b: number } }) => obj.a.b * 2)
    const memoizedFn = safeMemoize(mockFn)

    const obj1 = { a: { b: 5 } }
    const obj2 = { a: { b: 5 } }

    expect(memoizedFn(obj1)).toBe(10)
    expect(memoizedFn(obj2)).toBe(10)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('works with arrays', () => {
    const mockFn = jest.fn((arr: number[]) => arr.reduce((a, b) => a + b, 0))
    const memoizedFn = safeMemoize(mockFn)

    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 3]

    expect(memoizedFn(arr1)).toBe(6)
    expect(memoizedFn(arr2)).toBe(6)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('works with exodus models', () => {
    const mockFn = jest.fn((model: ModelLike) => model.name.toUpperCase())
    const memoizedFn = safeMemoize(mockFn)

    const model = {
      name: 'test',
      toJSON() {
        return { id: 1, name: 'test' }
      },
    }

    expect(memoizedFn(model)).toBe('TEST')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('works with dates', () => {
    const mockFn = jest.fn((date: Date) => date.getFullYear())
    const memoizedFn = safeMemoize(mockFn)

    const date1 = new Date('2023-10-10')
    const date2 = new Date('2023-10-10')

    expect(memoizedFn(date1)).toBe(2023)
    expect(memoizedFn(date2)).toBe(2023)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('works with Map instances', () => {
    const mockFn = jest.fn((collection: Map<string, number>) => {
      return [...collection.entries()].length
    })
    const memoizedFn = safeMemoize(mockFn)

    const map1 = new Map([
      ['a', 1],
      ['b', 2],
    ])
    const map2 = new Map([
      ['a', 1],
      ['b', 2],
    ])

    expect(memoizedFn(map1)).toBe(2)
    expect(memoizedFn(map2)).toBe(2)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('works with Set instances', () => {
    const mockFn = jest.fn((collection: Set<number>) => {
      return collection.size
    })
    const memoizedFn = safeMemoize(mockFn)

    const set1 = new Set([1, 2, 3])
    const set2 = new Set([1, 2, 3])

    expect(memoizedFn(set1)).toBe(3)
    expect(memoizedFn(set2)).toBe(3)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('throws when value cannot be serialized', () => {
    const unserializable = {
      get value() {
        throw new Error('Cannot access property')
      },
    }

    const mockFn = jest.fn((x: unknown) => x)
    const memoizedFn = safeMemoize(mockFn)

    expect(() => memoizedFn(unserializable)).toThrow(
      'Value could not be serialized for memoization'
    )

    expect(mockFn).not.toHaveBeenCalled()
  })
})
