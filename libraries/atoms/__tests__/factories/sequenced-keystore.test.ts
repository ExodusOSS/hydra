import createInMemoryStorage from '@exodus/storage-memory'

import createSequencedKeystoreAtom from '../../src/factories/sequenced-keystore.js'
import type { Keystore } from '../../src/utils/types.js'

describe('sequenced-keystore atom', () => {
  type Params = {
    initialValue?: (string | number)[]
    key?: string
    defaultValue?: (string | number)[]
  }

  const factory = async ({ initialValue, key = '', defaultValue = [] }: Params = {}) => {
    const storage = createInMemoryStorage()

    if (initialValue !== undefined) {
      await Promise.all(initialValue.map((value, index) => storage.set(`${key}.${index}`, value)))
    }

    const keystore = {
      getSecret: storage.get,
      setSecret: storage.set,
      deleteSecret: storage.delete,
    } as unknown as Keystore

    const atom = createSequencedKeystoreAtom({
      keystore,
      config: {
        key,
        defaultValue,
        isSoleWriter: true,
      },
    })

    return { atom, storage }
  }

  test('throw if key missing', async () => {
    await expect(factory()).rejects.toThrow(/key missing/)
  })

  test('throw if non array default value passed', async () => {
    await expect(factory({ key: 'test', defaultValue: {} as never })).rejects.toThrow(
      /must be an array/
    )
  })

  test('supports get()', async () => {
    const { atom } = await factory({ key: 'test' })
    await atom.set(['a'])

    expect(await atom.get()).toEqual(['a'])
  })

  test('supports get() with defaultValue', async () => {
    const { atom } = await factory({ key: 'test', defaultValue: ['a'] })

    expect(await atom.get()).toEqual(['a'])
  })

  test('emits current value to observers', async () => {
    const { atom } = await factory({ key: 'test', initialValue: ['a'] })
    const value = await new Promise(atom.observe)

    expect(value).toEqual(['a'])
  })

  test('emits updates to observers', async () => {
    const { atom } = await factory({ key: 'test' })

    const jestFn = jest.fn()

    atom.observe((result) => jestFn(result))

    await atom.set(['b'])

    expect(jestFn).toHaveBeenCalledTimes(2)
    expect(jestFn).toHaveBeenNthCalledWith(1, [])
    expect(jestFn).toHaveBeenNthCalledWith(2, ['b'])
  })

  test('get() returns the new value after set()', async () => {
    const { atom } = await factory({ key: 'a.b.c' })
    await atom.set([1, 2])
    expect(await atom.get()).toEqual([1, 2])
  })

  test('observe() is not notified after unsubscribe', async () => {
    const { atom } = await factory({ key: 'a.b.c' })
    const jestFn = jest.fn()

    const unsubscribe = atom.observe((result) => jestFn(result))

    await atom.set([2])
    unsubscribe()
    await atom.set([3])

    expect(jestFn).toHaveBeenCalledTimes(2)
    expect(jestFn).toHaveBeenNthCalledWith(1, [])
    expect(jestFn).toHaveBeenNthCalledWith(2, [2])
  })

  test('throws if set() non array value', async () => {
    const { atom } = await factory({ key: 'a.b.c' })

    await expect(atom.set(1 as never)).rejects.toThrowError(/must be an array/)
  })

  test('set(undefined) should clear sequence', async () => {
    const { atom, storage } = await factory({ key: 'a.b.c' })

    await atom.set([1, 2, 3])

    expect(await atom.get()).toEqual([1, 2, 3])

    await atom.set(undefined)

    expect(await atom.get()).toEqual([])
    expect(await storage.get('a.b.c.0')).toEqual(undefined)
    expect(await storage.get('a.b.c.1')).toEqual(undefined)
    expect(await storage.get('a.b.c.2')).toEqual(undefined)
  })

  test('set() should write sequentially in storage', async () => {
    const { atom, storage } = await factory({ key: 'a.b.c' })

    await atom.set([1, 2, 3])

    expect(await storage.get('a.b.c.0')).toEqual(1)
    expect(await storage.get('a.b.c.1')).toEqual(2)
    expect(await storage.get('a.b.c.2')).toEqual(3)
    expect(await storage.get('a.b.c.3')).toEqual(undefined)

    await atom.set([4, 5])

    expect(await storage.get('a.b.c.0')).toEqual(4)
    expect(await storage.get('a.b.c.1')).toEqual(5)
    expect(await storage.get('a.b.c.2')).toEqual(undefined)
    expect(await storage.get('a.b.c.3')).toEqual(undefined)
  })
})
