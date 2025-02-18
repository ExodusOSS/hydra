import type { Storage } from '@exodus/storage-interface'
import createInMemoryStorage from '@exodus/storage-memory'

import type { Atom } from '../../src/index.js'

const FRESH = 'fresh'
const CACHED = 'cached'

const key = 'storage-cache-test'
const logger = { warn: jest.fn() }

const cacheAtom = {
  get: jest.fn().mockResolvedValue(CACHED),
  reset: jest.fn(),
  set: jest.fn(),
}

const mockCreateStorageAtom = jest.fn(() => cacheAtom)

jest.doMock('../../src/factories/storage.js', () => {
  return () => mockCreateStorageAtom
})

const { createInMemoryAtom, withStorageCache } = await import('../../src/index.js')

const toReadonly = (atom: Atom<string>): Atom<string> => {
  const copy = { ...atom }
  return { get: copy.get, observe: copy.observe } as Atom<string>
}

describe('withStorageCache', () => {
  let atom: Atom<string>
  let storage: Storage<string>

  beforeEach(() => {
    jest.clearAllMocks()

    atom = createInMemoryAtom<string>({ defaultValue: FRESH })
    storage = createInMemoryStorage<string>()
  })

  describe('enhancing', () => {
    it('creates a cache atom', () => {
      withStorageCache<string>({ atom, storage, key, logger })
      expect(mockCreateStorageAtom).toHaveBeenCalled()
    })

    it('works with only mandatory options', () => {
      withStorageCache<string>({ atom, storage, key, logger })
      expect(mockCreateStorageAtom).toHaveBeenCalled()
    })

    it('warns if cached atom has not set method', () => {
      const noSetAtom = { ...atom } as unknown as Atom<string>

      // @ts-expect-error Delete is not allowed for non-optional operand
      delete noSetAtom.set

      withStorageCache<string>({ atom: noSetAtom, storage, key, logger })
      expect(logger.warn).toHaveBeenCalledTimes(1)
      expect(logger.warn).toHaveBeenCalledWith(
        'Atom does not have a "set" method, cache will last only until the app is restarted'
      )
    })
  })

  describe('operations (writable atoms)', () => {
    let enhanced: Atom<string>

    beforeEach(() => {
      enhanced = withStorageCache<string>({ atom, storage, key, logger })
    })

    describe('get', () => {
      it('initially returns the fresh value', async () => {
        const value = await enhanced.get()
        expect(value).toBe(FRESH)
      })

      it('caches the value on read', async () => {
        await enhanced.get()
        expect(cacheAtom.set).toHaveBeenCalledWith(FRESH)
      })

      it('returns the cached value on subsequent reads', async () => {
        await enhanced.get()
        const value = await enhanced.get()
        expect(value).toBe(CACHED)
      })
    })

    describe('set', () => {
      it('invalidates existing cache', async () => {
        await enhanced.get()
        await enhanced.set(FRESH)
        const value = await enhanced.get()
        expect(value).toBe(FRESH)
      })
    })

    describe('reset', () => {
      it('invalidates existing cache', async () => {
        await enhanced.get()
        await enhanced.reset()
        const value = await enhanced.get()
        expect(value).toBe(FRESH)
      })

      it('clears the cache', async () => {
        await enhanced.get()
        await enhanced.reset()
        expect(cacheAtom.reset).toHaveBeenCalled()
      })
    })
  })

  describe('operations (readonly atoms)', () => {
    let readOnlyAtom: Atom<string>
    let enhanced: Atom<string>

    beforeEach(async () => {
      jest.clearAllMocks()
      readOnlyAtom = toReadonly(atom)
      enhanced = withStorageCache<string>({ atom: readOnlyAtom, storage, key, logger })

      await enhanced.get()
      const value = await enhanced.get()
      expect(value).toBe(CACHED)
    })

    describe('set', () => {
      it('clears cache of readonly atoms', async () => {
        await enhanced.set(FRESH)
        const value = await enhanced.get()
        expect(value).toBe(FRESH)
      })

      it('warns about trying to write to a readonly atom', async () => {
        await enhanced.set(FRESH)
        expect(logger.warn).toHaveBeenCalledWith(
          'Failed to write to atom, is it a readonly atom? Clearing cache...',
          expect.any(Error)
        )
      })
    })

    describe('reset', () => {
      it('clears cache of readonly atoms', async () => {
        await enhanced.reset()
        const value = await enhanced.get()
        expect(value).toBe(FRESH)
      })

      it('warns about trying to write to a readonly atom', async () => {
        await enhanced.reset()
        expect(logger.warn).toHaveBeenCalledWith(
          'Failed to write to atom, is it a readonly atom? Clearing cache...',
          expect.any(Error)
        )
      })
    })
  })

  describe('operations (edge-cases)', () => {
    let enhanced: Atom<string>

    beforeEach(() => {
      enhanced = withStorageCache<string>({ atom, storage, key, logger })
    })

    it('returns the fresh value if cache fails', async () => {
      const value = await enhanced.get()
      expect(value).toBe(FRESH)
    })

    it('logs a warning if cache read fails', async () => {
      await enhanced.get()
      cacheAtom.get.mockRejectedValueOnce(new Error('test'))
      await enhanced.get()
      expect(logger.warn).toHaveBeenCalled()
    })

    it('attempts to revalidate when cache fails', async () => {
      cacheAtom.get.mockRejectedValueOnce(new Error('test'))
      await enhanced.get()
      expect(cacheAtom.set).toHaveBeenCalledWith(FRESH)
    })

    it('still works if revalidation also fails', async () => {
      cacheAtom.get.mockRejectedValueOnce(new Error('test'))
      cacheAtom.set.mockRejectedValueOnce(new Error('test'))
      const value = await enhanced.get()
      expect(value).toBe(FRESH)
    })

    it('logs a warning if cache write fails', async () => {
      cacheAtom.set.mockRejectedValueOnce(new Error('test'))
      await enhanced.get()
      expect(logger.warn).toHaveBeenCalled()
    })
  })
})
