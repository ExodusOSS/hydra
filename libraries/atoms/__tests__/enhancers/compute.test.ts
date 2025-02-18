import type { Atom } from '../../src/index.js'
import { combine, compute, createInMemoryAtom } from '../../src/index.js'

describe('compute', () => {
  test('returns selected value', async () => {
    const intsAtom = createInMemoryAtom<number[]>({
      defaultValue: [],
    })

    const oddIntsAtom = compute({
      atom: intsAtom,
      selector: (nums) => nums.filter((num) => num % 2),
    })

    void intsAtom.set([0, 1, 2, 3, 4])

    const odds = await new Promise(oddIntsAtom.observe)
    expect(odds).toEqual([1, 3])
    expect(await oddIntsAtom.get()).toEqual(odds)
    await expect((oddIntsAtom as Atom<number[]>).set([0, 1, 2])).rejects.toThrow(/does not support/)
  })

  test('returns selected value (async selector)', async () => {
    const intsAtom = createInMemoryAtom<number[]>({
      defaultValue: [],
    })

    const oddIntsAtom = compute({
      atom: intsAtom,
      selector: async (nums) => nums.filter((num) => num % 2),
    })

    void intsAtom.set([0, 1, 2, 3, 4])

    const odds = await new Promise(oddIntsAtom.observe)
    expect(odds).toEqual([1, 3])
  })

  test('returns ignore updates if result is the same', async () => {
    const intsAtom = createInMemoryAtom<number>()

    const computedAtom = compute({
      atom: intsAtom,
      selector: (value) => ([0, 1].includes(value) ? undefined : 10),
    })

    const handler = jest.fn()
    computedAtom.observe(handler)
    await intsAtom.set(0)
    expect(handler).toBeCalledTimes(1)
    expect(handler.mock.calls[0][0]).toEqual(undefined)
    expect(await computedAtom.get()).toEqual(undefined)
    handler.mockReset()
    await intsAtom.set(0)
    await intsAtom.set(1)
    expect(handler).toBeCalledTimes(0)
    await intsAtom.set(2)
    expect(handler).toBeCalledTimes(1)
    expect(handler.mock.calls[0][0]).toEqual(10)
  })

  test('returns ignore updates if result is the same (async selector)', async () => {
    const intsAtom = createInMemoryAtom<number>()

    const computedAtom = compute({
      atom: intsAtom,
      selector: async (value) => ([0, 1].includes(value) ? undefined : 10),
    })

    const handler = jest.fn()
    computedAtom.observe(handler)
    await intsAtom.set(0)
    expect(handler).toBeCalledTimes(1)
    expect(handler.mock.calls[0][0]).toEqual(undefined)
    expect(await computedAtom.get()).toEqual(undefined)
    handler.mockReset()
    await intsAtom.set(0)
    await intsAtom.set(1)
    expect(handler).toBeCalledTimes(0)
    await intsAtom.set(2)
    expect(handler).toBeCalledTimes(1)
    expect(handler.mock.calls[0][0]).toEqual(10)
  })

  test('accepts a readonly atom (type test)', async () => {
    const nameAtom = createInMemoryAtom({ defaultValue: 'Bruce Wayne' })
    const identityAtom = createInMemoryAtom({ defaultValue: 'Batman' })

    const combined = combine({ name: nameAtom, identity: identityAtom })
    const computed = compute({
      atom: combined,
      selector: ({ name, identity }) => `${name} is ${identity}`,
    })

    await expect(computed.get()).resolves.toBe('Bruce Wayne is Batman')
  })

  describe('selector memoization', () => {
    test('.get uses memoized value', async () => {
      const intsAtom = createInMemoryAtom<number>()

      const selector = jest
        .fn()
        .mockImplementation(async (value) => ([0, 1].includes(value) ? undefined : 10))

      const computedAtom = compute({
        atom: intsAtom,
        selector,
      })

      void intsAtom.set(0)
      const result01 = await computedAtom.get()
      const result02 = await computedAtom.get()

      expect(result01).toBe(result02)
      expect(selector).toHaveBeenCalledTimes(1)

      void intsAtom.set(5)
      const result03 = await computedAtom.get()
      await computedAtom.get()

      expect(result03).not.toBe(result01)
      expect(selector).toHaveBeenCalledTimes(2)
    })

    test('.observe uses memoized value', async () => {
      const intsAtom = createInMemoryAtom<number>()

      const observer = jest.fn()
      const selector = jest
        .fn()
        .mockImplementation(async (value) => ([0, 1].includes(value) ? undefined : 10))

      const computedAtom = compute({
        atom: intsAtom,
        selector,
      })

      computedAtom.observe(observer)

      void intsAtom.set(0)
      void intsAtom.set(1)
      void intsAtom.set(1)

      await new Promise(setImmediate)
      expect(selector).toHaveBeenCalledTimes(2)

      void intsAtom.set(5)
      void intsAtom.set(5)

      await new Promise(setImmediate)
      expect(selector).toHaveBeenCalledTimes(3)
    })
  })
})
