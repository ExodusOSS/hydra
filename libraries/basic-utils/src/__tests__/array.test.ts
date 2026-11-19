import { shuffled } from '../array.js'

describe('shuffled', () => {
  test('throws on non-array', () => {
    expect(() => shuffled(undefined as any)).toThrow()
    expect(() => shuffled(null as any)).toThrow()
    expect(() => shuffled({} as any)).toThrow()
    expect(Array.isArray(shuffled([1, 2, 3]))).toBe(true)
  })

  test('returns arrays on arrays', () => {
    expect(() => shuffled(undefined as any)).toThrow()
    expect(() => shuffled(null as any)).toThrow()
    expect(() => shuffled({} as any)).toThrow()
    expect(Array.isArray(shuffled([1, 2, 3]))).toBe(true)
  })

  test('returns a shallow copy', () => {
    const empty: number[] = []
    expect(shuffled(empty)).not.toBe(empty)
    expect(shuffled(empty)).toEqual(empty)

    const single = [42]
    expect(shuffled(single)).not.toBe(single)
    expect(shuffled(single)).toEqual(single)

    const object = [{}]
    expect(shuffled(object)).not.toBe(object)
    expect(shuffled(object)).toEqual(object)
    expect(shuffled(object)[0]).toBe(object[0])
  })

  const sorted = (arr: number[]): number[] => [...arr].sort((a, b) => a - b)

  test('shuffles an array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i)

    const s0 = shuffled(arr)
    expect(sorted(s0)).toEqual(arr)
    expect(s0).not.toEqual(arr)

    const s1 = shuffled(arr)
    expect(sorted(s1)).toEqual(arr)
    expect(s1).not.toEqual(arr)
    expect(s1).not.toEqual(s0)
  })

  test('is mockable', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i)

    jest.spyOn(Math, 'random').mockReturnValue(0)
    const s0 = shuffled(arr)
    jest.restoreAllMocks()
    expect(s0).toEqual(arr)
    expect(s0).not.toBe(arr)

    const s1 = shuffled(arr)
    expect(sorted(s1)).toEqual(arr)
    expect(s1).not.toEqual(arr)
  })

  test('linear time', () => {
    // At this size a quadratic shuffle (e.g. splice-based) takes over a minute,
    // while Fisher-Yates takes ~50ms uncontended. The budget leaves room for
    // shared CI runners that execute many test suites concurrently.
    const length = 1e6
    const arr = Array.from({ length }, (_, i) => i)
    const start = Date.now()
    expect(shuffled(arr).length).toBe(length)
    expect(Date.now() - start).toBeLessThan(4000)
  })
})
