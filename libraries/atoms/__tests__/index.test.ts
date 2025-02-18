import atomTests from '@exodus/atom-tests'
import type { Storage } from '@exodus/storage-interface'
import createInMemoryStorage from '@exodus/storage-memory'
import delay from 'delay'
import EventEmitter from 'eventemitter3'

import createKeystoreAtom from '../src/factories/keystore.js'
import type { Atom } from '../src/index.js'
import { createAtomMock, createStorageAtomFactory, fromEventEmitter } from '../src/index.js'
import type { Keystore } from '../src/utils/types.js'

const path = 'a.b.c'

type FactoryParams = {
  defaultValue?: any
  initialValue?: any
}

type FactoryReturnValue = {
  atom: Atom<any>
  set?: (value: any) => Promise<void>
}

const cases: {
  name: string
  factory: (params: FactoryParams) => Promise<FactoryReturnValue> | FactoryReturnValue
  isWritable: boolean
  isObservable: boolean
}[] = [
  {
    name: 'storage',
    factory: async ({ defaultValue, initialValue } = {}) => {
      const storage = createInMemoryStorage()
      if (initialValue !== undefined) await storage.set(path, initialValue)

      const atom = createStorageAtomFactory({ storage })({
        key: path,
        defaultValue,
      })
      return {
        atom,
        set: atom.set,
      }
    },
    isWritable: true,
    isObservable: true,
  },
  {
    name: 'keystore',
    factory: async ({ defaultValue, initialValue } = {}) => {
      const storage = createInMemoryStorage()
      if (initialValue !== undefined) await storage.set(path, initialValue)

      const keystore = {
        getSecret: storage.get,
        setSecret: storage.set,
        deleteSecret: storage.delete,
      } as unknown as Keystore

      const atom = createKeystoreAtom({
        keystore,
        config: {
          key: path,
          defaultValue,
          isSoleWriter: true,
        },
      })
      return {
        atom,
        set: atom.set,
      }
    },
    isWritable: true,
    isObservable: true,
  },
  {
    name: 'eventEmitter',
    factory: ({ defaultValue, initialValue = defaultValue } = {}) => {
      let value = initialValue
      const emitter = new EventEmitter()
      const set = async (newValue: any) => {
        value = newValue
        emitter.emit('data', newValue)
      }

      const atom = fromEventEmitter({
        emitter,
        event: 'data',
        // delay to facilitate testing race conditions
        get: async () => delay(1).then(() => value),
      } as never)

      return {
        atom,
        set,
      }
    },
    isWritable: false,
    isObservable: true,
  },
  {
    name: 'atomMock',
    factory: ({ defaultValue, initialValue = defaultValue } = {}) => {
      const atom = createAtomMock({ defaultValue: initialValue })
      return {
        atom,
        set: atom.set,
      }
    },
    isWritable: true,
    isObservable: true,
  },
]

cases.forEach(atomTests)

describe('storage atom', () => {
  test('set(undefined) should delete key', async () => {
    const storage = createInMemoryStorage()
    const atom = createStorageAtomFactory({ storage })({ key: path })

    storage.delete = jest.fn(storage.delete)

    await atom.set(1)

    expect(await atom.get()).toEqual(1)

    await atom.set(undefined)

    expect(await atom.get()).toEqual(undefined)
    expect(storage.delete).toHaveBeenCalled()
  })

  test('observe() is not notified after unsubscribe', async () => {
    const state: Record<string, any> = {}
    const getDelay = 1
    const setDelay = 1
    const storage = {
      get: async (key: string) => delay(getDelay).then(() => state[key]),
      set: async (key: string, value: any) =>
        delay(setDelay).then(() => {
          state[key] = value
        }),
    } as unknown as Storage

    const atom = createStorageAtomFactory({ storage })({
      key: path,
      defaultValue: 1,
    })

    const jestFn = jest.fn()
    const jestFn2 = jest.fn()

    const unsubscribe = atom.observe((result) => {
      jestFn(result)
    })
    atom.observe((result) => {
      jestFn2(result)
    })
    await atom.set(2)
    void atom.set(3)

    unsubscribe()
    await atom.set(4)
    await delay(getDelay) // to make sure "get" finished
    expect(jestFn.mock.calls).toEqual([[2]])
    expect(jestFn2.mock.calls).toEqual([[2], [3], [4]])
  })

  test('wait get till set is done ', async () => {
    const storage = createInMemoryStorage()
    const atom = createStorageAtomFactory({ storage })({ key: path })
    const resolver = jest.fn()
    void atom.set(1).then(() => resolver(1))
    const getPromise = atom.get().then((value) => resolver(`get:${value}`))
    const secondSetPromise = atom.set(2).then(() => resolver(2))

    await getPromise
    await secondSetPromise

    expect(resolver.mock.calls).toEqual([['get:1'], [1], [2]])
  })

  test('multiple "set"s blocks "get"', async () => {
    const storage = createInMemoryStorage()
    const atom = createStorageAtomFactory({ storage })({ key: path })
    const resolver = jest.fn()
    void atom.set(1).then(() => resolver(1))
    const secondSetPromise = atom.set(2).then(() => resolver(2))
    const getPromise = atom.get().then((value) => resolver(`get:${value}`))

    await getPromise
    await secondSetPromise

    expect(resolver.mock.calls).toEqual([['get:1'], [1], [2]])
  })
})
