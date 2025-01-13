import type { Atom } from '../../src/index.js'
import { compute, createInMemoryAtom } from '../../src/index.js'
import dedupe from '../../src/enhancers/dedupe.js'
import delay from 'delay'

describe('dedupe enhancer (writable)', () => {
  let atom: Atom<{ name: string } | undefined>
  let underlyingAtom: Atom<{ name: string } | undefined>

  const value = { name: 'the batman' }
  beforeEach(() => {
    underlyingAtom = createInMemoryAtom({ defaultValue: value })
    atom = dedupe(underlyingAtom)
  })

  it('should call observe only once when equal object was set', async () => {
    const handler = jest.fn()
    atom.observe(handler)

    await delay(0)
    expect(handler).toHaveBeenCalledTimes(1)

    await atom.set({ ...value })
    await delay(0)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should call pass through undefined without fn form form set()', async () => {
    underlyingAtom.reset = jest.fn()
    await atom.set(undefined)
    expect(underlyingAtom.reset).toHaveBeenCalled()
  })

  describe.each(['sync', 'async'])('set with `(prev) => newVal` syntax (%s)', (type) => {
    const wrap =
      type === 'sync'
        ? (fn: any) => fn
        : (fn: any) =>
            async (...args: any) =>
              fn(...args)

    it('should not break', async () => {
      await atom.set(
        wrap(({ name }: any) =>
          name === 'the batman' ? { name: `${name} is Harvey Dent` } : { name }
        )
      )

      await expect(atom.get()).resolves.toEqual({ name: 'the batman is Harvey Dent' })
    })

    it('should call observe only once when equal object was set', async () => {
      const handler = jest.fn()
      atom.observe(handler)

      await delay(0)
      expect(handler).toHaveBeenCalledTimes(1)

      await atom.set(wrap(() => ({ ...value })))
      await delay(0)

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
})

describe('dedupe enhancer (read-only)', () => {
  let atom: Atom<number[] | undefined>
  let underlyingAtom: Atom<{ [key: string]: number[] }>

  beforeEach(() => {
    underlyingAtom = createInMemoryAtom()
    atom = dedupe(
      compute({
        atom: underlyingAtom,
        selector: ({ a }) => a,
      }) as Atom<number[] | undefined>
    ) as Atom<number[] | undefined>
  })

  it('should return a read-only atom', async () => {
    await expect(atom.set([])).rejects.toThrow()
  })

  it('should dedupe avoid calling observers if the value didnt change', async () => {
    const handler = jest.fn()
    atom.observe(handler)

    await underlyingAtom.set({ a: [1, 2, 3] })
    await underlyingAtom.set({ a: [1, 2, 3], b: [4, 5, 6] })
    await new Promise(setImmediate)

    expect(handler).toHaveBeenCalledTimes(1)

    await underlyingAtom.set({ a: [1, 2, 3, 4], b: [4, 5, 6] })
    await new Promise(setImmediate)

    expect(handler).toHaveBeenCalledTimes(2)
  })
})
