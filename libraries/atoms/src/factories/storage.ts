import createSimpleObserver from '../simple-observer.js'
import enforceObservableRules from '../enforce-rules.js'
import type { Atom, ResettableListener } from '../utils/types.js'
import type { Storage } from '@exodus/storage-interface'

type FactoryParams<T> = {
  storage: Storage<T>
}

type Params<D> = {
  key: string
  defaultValue?: D
}

const createStorageAtomFactory = <T>({ storage }: FactoryParams<T>) => {
  function createStorageAtom(opts: Omit<Params<unknown>, 'defaultValue'>): Atom<T | undefined>
  function createStorageAtom<D extends T>(opts: Params<D>): Atom<T | D>
  function createStorageAtom<D extends T>({ key, defaultValue }: Params<D>): Atom<T | D> {
    let version = 0
    const { notify, observe, listeners } = createSimpleObserver<T | undefined>({ enable: true })

    let canUseCached = false
    let cached: T | undefined
    let pendingWrite: Promise<void> | undefined

    // enforce-rules make it non concurrent
    const set = async (value: T | undefined) => {
      version++
      pendingWrite = (async () => {
        if (value === undefined) {
          await storage.delete(key)
          canUseCached = false
        } else {
          await storage.set(key, value)
          canUseCached = true
        }

        cached = value
        pendingWrite = undefined
      })()

      await pendingWrite
      await notify(value)

      if (!canUseCached && listeners.length > 0) {
        listeners.forEach((listener) => (listener as ResettableListener<T>).resetCallState())
      }
    }

    const get = async () => {
      if (pendingWrite) {
        await pendingWrite
      }

      if (canUseCached) {
        return cached
      }

      const currentVersion = version
      const value = await storage.get(key)

      if (currentVersion !== version) {
        return get()
      }

      cached = value
      canUseCached = true

      return value
    }

    return enforceObservableRules({
      get,
      set,
      observe,
      defaultValue,
      // Making the "get" concurrent is a perf win on boot
      // since it prevents queueing up a flood of storage reads
      // and forces the usage of the in-memory cached value instead
      makeGetNonConcurrent: true,
    }) as Atom<T | D>
  }

  return createStorageAtom
}

export default createStorageAtomFactory
