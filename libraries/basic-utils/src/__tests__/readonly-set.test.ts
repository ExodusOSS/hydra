import { ReadonlySet } from '../readonly-set.js'

describe('ReadonlySet', () => {
  let readable: ReadonlySet<number>
  let writable: Set<number>

  beforeEach(() => {
    writable = new Set([1, 2, 3])
    readable = new ReadonlySet(writable)
  })

  test('has()', () => {
    expect(readable.has(1)).toBe(true)
    expect(readable.has(4)).toBe(false)
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
      [1, 1, readable],
      [2, 2, readable],
      [3, 3, readable],
    ])
  })

  test('forEach() does not leak the underlying mutable set', () => {
    readable.forEach((_value, _value2, set) => {
      expect(set).toBe(readable)
      expect(set).not.toBe(writable)
    })
  })

  test('size', () => {
    expect(readable.size).toBe(3)
    writable.add(4)
    expect(readable.size).toBe(4)
  })

  test('delete() throws', () => {
    expect(() => readable.delete()).toThrow(/read-only/)
  })

  test('clear() throws', () => {
    expect(() => readable.clear()).toThrow(/read-only/)
  })

  test('is iterable', () => {
    expect(new Set(readable)).toEqual(writable)
  })

  test('toStringTag', () => {
    expect(Object.prototype.toString.call(readable)).toBe('[object ReadonlySet]')
  })
})
