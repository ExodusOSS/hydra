import { createInMemoryAtom, mergeWithValue } from '../../src/index.js'

type Value = { a?: number; b?: number; c?: number }

describe('mergeWithValue', () => {
  test('get returns merged value', async () => {
    const rawAtom = createInMemoryAtom<Value>({ defaultValue: { a: 1 } })
    const atom = mergeWithValue({ atom: rawAtom, value: { b: 2 } })
    expect(await atom.get()).toEqual({ a: 1, b: 2 })
    await atom.set({ a: 2 })
    expect(await atom.get()).toEqual({ a: 2, b: 2 })
    await atom.set({ a: 2, b: 3 })
    expect(await atom.get()).toEqual({ a: 2, b: 3 })
  })

  test('upgrades from old version', async () => {
    const rawAtom = createInMemoryAtom<Value>()
    const oldAtom = mergeWithValue({ atom: rawAtom, value: { a: 1 } })
    await oldAtom.set({ a: 2 })
    expect(await oldAtom.get()).toEqual({ a: 2 })
    const newAtom = mergeWithValue({ atom: rawAtom, value: { a: 1, b: 2 } })
    expect(await newAtom.get()).toEqual({ a: 2, b: 2 })
  })

  test('observe returns merged value', async () => {
    const observer = jest.fn()
    const rawAtom = createInMemoryAtom<Value>({ defaultValue: { a: 1 } })
    const atom = mergeWithValue({ atom: rawAtom, value: { b: 2 } })
    atom.observe(observer)
    await atom.set({ a: 2 })
    expect(observer).toHaveBeenCalledWith({ a: 2, b: 2 })
  })

  test('merge value in set function', async () => {
    const rawAtom = createInMemoryAtom<Value>({ defaultValue: { a: 1 } })
    const atom = mergeWithValue({ atom: rawAtom, value: { b: 2 } })
    await atom.set((value) => {
      expect(value).toEqual({ a: 1, b: 2 })
      return { ...value, a: 2 }
    })
    expect(await atom.get()).toEqual({ a: 2, b: 2 })
  })

  test('default value overrides the merge value', async () => {
    const rawAtom = createInMemoryAtom<Value>({ defaultValue: { a: 1, b: 2 } })
    const atom = mergeWithValue({ atom: rawAtom, value: { b: 3, c: 4 } })
    expect(await atom.get()).toEqual({ a: 1, b: 2, c: 4 })
    await atom.set((value) => {
      expect(value).toEqual({ a: 1, b: 2, c: 4 })
      return value
    })
  })
})
