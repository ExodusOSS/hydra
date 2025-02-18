import createDeferringStorage from '@exodus/deferring-storage'
import _createEncryptedStorage from '@exodus/storage-encrypted/lib/storage'
import type { Storage } from '@exodus/storage-interface'
import createInMemoryStorage from '@exodus/storage-memory'
import pDefer from 'p-defer'

import { createStorageAtomFactory } from '../../src/index.js'

function createEncryptedStorage(storage: Storage<string, string>) {
  const deferred = pDefer()
  let isUnlocked = false
  return {
    ..._createEncryptedStorage({
      storage,
      cryptoFunctionsPromise: deferred.promise,
    }),
    unlock: (cryptoFunctions: unknown) => {
      deferred.resolve(cryptoFunctions)
      isUnlocked = true
    },
    _isUnlocked: () => isUnlocked,
    _storage: storage,
  }
}

describe('createStorageAtomFactory', () => {
  let storage: Storage<string>
  let createStorageAtom: ReturnType<typeof createStorageAtomFactory<string>>

  beforeEach(() => {
    storage = createInMemoryStorage()
    createStorageAtom = createStorageAtomFactory({ storage })
  })

  it('should reset dangling observer after clearing', async () => {
    const deferringStorage = createDeferringStorage(storage)
    const createAtom = createStorageAtomFactory({ storage: deferringStorage as never })
    const atom = createAtom({ key: 'identity', defaultValue: 'Bruce Wayne' })

    const handler = jest.fn()
    const whenCalledWithHarvey = pDefer()

    atom.observe((value) => {
      handler(value)

      if (value === 'Harvey Dent') {
        whenCalledWithHarvey.resolve()
      }
    })

    expect(handler).not.toHaveBeenCalled()
    await atom.reset()
    expect(handler).toHaveBeenCalledWith('Bruce Wayne')

    // simulating storage migration
    await storage.set('identity', 'Harvey Dent')

    deferringStorage.release()

    await whenCalledWithHarvey.promise
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith('Harvey Dent')
  })

  describe('maintain concurrency', () => {
    it('should return cached value after setting', async () => {
      jest.spyOn(storage, 'get')

      const atom = createStorageAtom({
        key: 'wayne-enterprises-pricing-server',
      })

      await atom.set('https://www.wayne-enterprises.com/')

      const url = await atom.get()

      expect(storage.get).not.toHaveBeenCalled()
      expect(url).toEqual('https://www.wayne-enterprises.com/')
    })
    it('should return cached value after setting during get request', async () => {
      const encryptedStorage = createEncryptedStorage(storage)
      const deferred = pDefer()
      encryptedStorage.unlock({
        encrypt: (value: any) => value,
        // simulate slow read
        decrypt: async (value: any) => {
          await deferred.promise
          return value
        },
      })
      const key = 'our-key'
      // setup initial value
      await encryptedStorage.set(key, 'first set value')

      const createStorageAtom = createStorageAtomFactory({
        storage: encryptedStorage,
      })
      const atom = createStorageAtom({
        key,
        isSoleWriter: true,
      })
      const valueFromGetReceivedPromise = pDefer()
      let valueFromGet

      void atom.get().then((value) => {
        valueFromGet = value
        valueFromGetReceivedPromise.resolve()
      })

      await atom.set('second set value')

      expect(valueFromGet).toEqual(undefined) // make sure get is not resolved yet

      deferred.resolve(true)
      await valueFromGetReceivedPromise.promise
      expect(valueFromGet).toEqual('second set value')
    })

    it('should return cached value after getting', async () => {
      await storage.set('wayne-enterprises-pricing-server', 'https://www.wayne-enterprises.com/')

      const atom = createStorageAtom({
        key: 'wayne-enterprises-pricing-server',
      })

      const fromStorage = await atom.get()

      jest.spyOn(storage, 'get')

      const fromCache = await atom.get()

      expect(storage.get).not.toHaveBeenCalled()
      expect(fromStorage).toEqual('https://www.wayne-enterprises.com/')
      expect(fromStorage).toEqual(fromCache)
    })

    it('should not queue a flood of read request when storage is locked', async () => {
      const readPromise = pDefer()
      const storage: any = {
        get: async () => readPromise.promise,
      }

      const atom = createStorageAtomFactory({ storage })({
        key: 'wayne-enterprises-pricing-server',
      })

      jest.spyOn(storage, 'get')

      const reads = Promise.all([atom.get(), atom.get(), atom.get()])
      readPromise.resolve('yay!')
      await reads

      expect(storage.get).toHaveBeenCalledTimes(1)
    })

    it('should not read from underlying storage multiple times before a value is cached', () => {
      const atom = createStorageAtom({
        key: 'wayne-enterprises-pricing-server',
        isSoleWriter: true,
      })

      jest.spyOn(storage, 'get')

      atom.observe(jest.fn())
      atom.observe(jest.fn())
      atom.observe(jest.fn())
      atom.observe(jest.fn())

      expect(storage.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('default value', () => {
    it('return type should omit undefined if set', async () => {
      const atom = createStorageAtom({
        key: 'wayne-enterprises-pricing-server',
        defaultValue: 'harry',
      })

      const value = await atom.get()
      // we are using toString to make sure the return type is string and not (string | undefined).
      // `toString` on the latter would give us a compiler error
      expect(value.toString()).toBe('harry')
    })

    it('return type should be union with undefined if missing', async () => {
      const atom = createStorageAtom({
        key: 'wayne-enterprises-pricing-server',
      })

      const value = await atom.get()
      // @ts-expect-error We don't have a default type, so the compiler should fail
      expect(() => value.toString()).toThrow()
    })
  })
})
