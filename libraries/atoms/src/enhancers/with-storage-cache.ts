import createStorageAtomFactory from '../factories/storage.js'
import type { Atom, Setter } from '../utils/types.js'
import type { Storage } from '@exodus/storage-interface'

type Params<T> = {
  atom: Atom<T>
  storage: Storage<T>
  key: string
  logger: Pick<Console, 'warn'>
}

const getCacheAtom = <T>({ storage, key }: Params<T>) => {
  const createStorageAtom = createStorageAtomFactory<T>({ storage })
  return createStorageAtom({ key })
}

const enhanceAtom = <T>(params: Params<T>): Atom<T> => {
  const { atom, logger } = params
  const cacheAtom = getCacheAtom(params)

  if (!atom.hasOwnProperty('set')) {
    logger.warn(
      'Atom does not have a "set" method, cache will last only until the app is restarted'
    )
  }

  let hasCache = false

  const setCache = async (fresh: T) => {
    try {
      await cacheAtom.set(fresh)
      hasCache = true
    } catch (error) {
      logger.warn('Failed to write to cache atom', error)
    }
  }

  const readCache = async () => {
    try {
      return (await cacheAtom.get()) as T
    } catch (error) {
      logger.warn('Failed to read from cache atom, returning fresh', error)
      return readFresh()
    }
  }

  const readFresh = async () => {
    const fresh = await atom.get()
    await setCache(fresh)
    return fresh
  }

  const set = async (value: T | Setter<T>) => {
    try {
      await atom.set(value as T)
    } catch (error) {
      logger.warn('Failed to write to atom, is it a readonly atom? Clearing cache...', error)
    } finally {
      hasCache = false
    }
  }

  const get = async (): Promise<T> => {
    return hasCache ? readCache() : readFresh()
  }

  const reset = async () => {
    try {
      await atom.reset()
      await cacheAtom.reset()
    } catch (error) {
      logger.warn('Failed to write to atom, is it a readonly atom? Clearing cache...', error)
    } finally {
      hasCache = false
    }
  }

  return { ...atom, get, set, reset }
}

/**
 * Caches the value of a given atom in a storage backed counterpart.
 */
const withStorageCache = <T>(params: Params<T>): Atom<T> => {
  return enhanceAtom(params)
}

export default withStorageCache
