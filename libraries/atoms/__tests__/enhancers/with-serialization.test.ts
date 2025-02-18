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
})
