import { ReadonlySet } from '../readonly-set.js'

describe('ReadonlySet', () => {
  let readable
  let writable
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
      [1, 1, new Set([1, 2, 3])],
      [2, 2, new Set([1, 2, 3])],
      [3, 3, new Set([1, 2, 3])],
    ])
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
