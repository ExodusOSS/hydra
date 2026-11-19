import { ReadonlyMap } from '../readonly-map.js'

describe('ReadonlyMap', () => {
  let readable: ReadonlyMap<string, number>
  let writable: Map<string, number>

  beforeEach(() => {
    writable = new Map([
      ['a', 1],
      ['b', 2],
    ])
    readable = new ReadonlyMap(writable)
  })

  test('has()', () => {
    expect(readable.has('a')).toBe(true)
    expect(readable.has('c')).toBe(false)
  })

  test('entries()', () => {
    expect(readable.entries()).toEqual(writable.entries())
  })

  test('keys()', () => {
    expect(readable.keys()).toEqual(writable.keys())
  })

  test('values()', () => {
    expect(readable.values()).toEqual(writable.values())
  })

  test('forEach()', () => {
    const callback = jest.fn()
    readable.forEach(callback)
    expect(callback.mock.calls).toEqual([
      [1, 'a', readable],
      [2, 'b', readable],
    ])
  })

  test('forEach() does not leak the underlying mutable map', () => {
    readable.forEach((_value, _key, map) => {
      expect(map).toBe(readable)
      expect(map).not.toBe(writable)
    })
  })

  test('size', () => {
    expect(readable.size).toBe(2)
    writable.set('c', 3)
    expect(readable.size).toBe(3)
  })

  test('set() throws', () => {
    expect(() => (readable as any).set('c', 3)).toThrow(/read-only/)
  })

  test('delete() throws', () => {
    expect(() => readable.delete()).toThrow(/read-only/)
  })

  test('clear() throws', () => {
    expect(() => readable.clear()).toThrow(/read-only/)
  })

  test('is iterable', () => {
    expect(new Map(readable)).toEqual(writable)
  })

  test('toStringTag', () => {
    expect(Object.prototype.toString.call(readable)).toBe('[object ReadonlyMap]')
  })
})
