import createInMemoryStorage from '@exodus/storage-memory'

import type { Atom } from '../../src/index.js'
import { createInMemoryAtom, createStorageAtomFactory, withSerialization } from '../../src/index.js'

describe('withSerialization', () => {
  let arrayAtom: Atom<number[]>
  let setAtom: Atom<Set<number>>

  beforeEach(() => {
    arrayAtom = createInMemoryAtom({
      defaultValue: [],
    })

    setAtom = withSerialization({
      atom: arrayAtom,
      serialize: (set) => [...set],
      deserialize: (arr) => new Set(arr),
    })
  })

  it('should serialize values ', async () => {
    await setAtom.set(new Set([1, 2, 3]))

    await expect(new Promise(arrayAtom.observe)).resolves.toEqual([1, 2, 3])
    await expect(arrayAtom.get()).resolves.toEqual([1, 2, 3])

    await expect(setAtom.get()).resolves.toEqual(new Set([1, 2, 3]))
    await expect(new Promise(setAtom.observe)).resolves.toEqual(new Set([1, 2, 3]))
  })

  it('should support a function on set', async () => {
    await setAtom.set(() => new Set([1, 2, 3]))

    await expect(new Promise(arrayAtom.observe)).resolves.toEqual([1, 2, 3])
    await expect(arrayAtom.get()).resolves.toEqual([1, 2, 3])

    await expect(setAtom.get()).resolves.toEqual(new Set([1, 2, 3]))
    await expect(new Promise(setAtom.observe)).resolves.toEqual(new Set([1, 2, 3]))
  })

  it('should pass previousValue deserialized to function provided to set', async () => {
    await setAtom.set((previousValue) => {
      previousValue.add(1)
      previousValue.add(2)
      return previousValue
    })

    await expect(new Promise(arrayAtom.observe)).resolves.toEqual([1, 2])
    await expect(arrayAtom.get()).resolves.toEqual([1, 2])

    await expect(setAtom.get()).resolves.toEqual(new Set([1, 2]))
    await expect(new Promise(setAtom.observe)).resolves.toEqual(new Set([1, 2]))
  })

  it('should avoid calling serialize if value is undefined', async () => {
    const serialize = jest.fn((value) => value)
    const deserialize = jest.fn((value) => value)

    const atom = withSerialization({
      atom: createInMemoryAtom(),
      serialize,
      deserialize,
    })

    await atom.set(undefined)

    expect(serialize).not.toHaveBeenCalled()
  })

  it('should avoid calling deserialize if value is undefined', async () => {
    const serialize = jest.fn((value) => value)
    const deserialize = jest.fn((value) => value)

    const storedAtom = createStorageAtomFactory({
      storage: createInMemoryStorage(),
    })({ key: 'some-key', defaultValue: undefined })

    const atom = withSerialization({
      atom: storedAtom,
      serialize,
      deserialize,
    })

    await expect(atom.get()).resolves.toBe(undefined)
    expect(deserialize).not.toHaveBeenCalled()
  })

  describe('setter function optimization', () => {
    it('should not call serialize when setter returns the same reference', async () => {
      const serialize = jest.fn((set: Set<number>) => [...set])
      const deserialize = jest.fn((arr: number[]) => new Set(arr))

      const atom = withSerialization({
        atom: createInMemoryAtom<number[]>({ defaultValue: [] }),
        serialize,
        deserialize,
        pure: true,
      })

      await atom.set(new Set([1, 2, 3]))
      const callsBefore = serialize.mock.calls.length

      await atom.set((prev) => prev)

      expect(serialize).toHaveBeenCalledTimes(callsBefore)
      await expect(atom.get()).resolves.toEqual(new Set([1, 2, 3]))
    })

    it('should call serialize when setter returns a new reference', async () => {
      const serialize = jest.fn((set: Set<number>) => [...set])
      const deserialize = jest.fn((arr: number[]) => new Set(arr))

      const atom = withSerialization({
        atom: createInMemoryAtom<number[]>({ defaultValue: [] }),
        serialize,
        deserialize,
        pure: true,
      })

      await atom.set(new Set([1, 2, 3]))
      const callsBefore = serialize.mock.calls.length

      await atom.set((prev) => new Set(prev))

      expect(serialize).toHaveBeenCalledTimes(callsBefore + 1)
    })

    it('should still serialize when setter returns same reference without pure flag', async () => {
      const serialize = jest.fn((set: Set<number>) => [...set])
      const deserialize = jest.fn((arr: number[]) => new Set(arr))

      const atom = withSerialization({
        atom: createInMemoryAtom<number[]>({ defaultValue: [] }),
        serialize,
        deserialize,
      })

      await atom.set(new Set([1, 2, 3]))
      const callsBefore = serialize.mock.calls.length

      await atom.set((prev) => prev)

      expect(serialize).toHaveBeenCalledTimes(callsBefore + 1)
    })

    it('should not write to storage when setter returns the same reference', async () => {
      const storage = createInMemoryStorage()
      const storageSpy = jest.spyOn(storage, 'set')

      const storedAtom = createStorageAtomFactory<number[]>({ storage })({
        key: 'test-key',
        defaultValue: [],
      })

      const atom = withSerialization({
        atom: storedAtom,
        serialize: (set: Set<number>) => [...set],
        deserialize: (arr: number[]) => new Set(arr),
        pure: true,
      })

      await atom.set(new Set([1, 2]))
      const writesBefore = storageSpy.mock.calls.length

      await atom.set((prev) => prev)

      expect(storageSpy).toHaveBeenCalledTimes(writesBefore)
    })

    it('should write to storage when setter returns a new reference', async () => {
      const storage = createInMemoryStorage()
      const storageSpy = jest.spyOn(storage, 'set')

      const storedAtom = createStorageAtomFactory<number[]>({ storage })({
        key: 'test-key',
        defaultValue: [],
      })

      const atom = withSerialization({
        atom: storedAtom,
        serialize: (set: Set<number>) => [...set],
        deserialize: (arr: number[]) => new Set(arr),
        pure: true,
      })

      await atom.set(new Set([1, 2]))
      const writesBefore = storageSpy.mock.calls.length

      await atom.set((prev) => new Set(prev))

      expect(storageSpy).toHaveBeenCalledTimes(writesBefore + 1)
    })
  })
})
