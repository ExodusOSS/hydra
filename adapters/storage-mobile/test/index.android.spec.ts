import { mock } from 'node:test'

import type { Storage } from '@exodus/storage-interface'
import runStorageSpecTestSuite from '@exodus/storage-spec'
import asMock from '@react-native-async-storage/async-storage/jest/async-storage-mock'

import createInMemoryFS from './helpers/filesystem.js'
import type { TestFilesystem } from './helpers/types.js'

mock.module('@exodus/react-native-fs', {
  defaultExport: {
    mkdir: jest.fn(),
    exists: jest.fn(),
    unlink: jest.fn(),
    DocumentDirectoryPath: '/document',
    readUtf8: jest.fn(),
    writeUtf8: jest.fn(),
  },
})

const { default: createStorageMobile } = await import('../src/index.android.js')

describe('storage-mobile', () => {
  let filesystem: TestFilesystem

  beforeEach(async () => {
    await asMock.clear()
    filesystem = createInMemoryFS()
  })

  describe('UTF-8 overflow', () => {
    function getInstance({
      rowLimit = 2 * 1024 * 1024,
      threshold,
      testFilesystem = filesystem,
    }: {
      rowLimit?: number
      threshold?: number
      testFilesystem?: TestFilesystem
    } = {}) {
      return createStorageMobile<string>({
        asyncStorage: {
          ...asMock,
          multiGet: async (keys) => {
            const entries = await asMock.multiGet(keys)
            for (const [, value] of entries) {
              if (value !== null && Buffer.byteLength(value, 'utf8') > rowLimit) {
                throw new Error('Row too big to fit into CursorWindow')
              }
            }

            return entries
          },
        },
        androidFallback: {
          filesystem: testFilesystem,
          hashString: (value) => btoa(value),
          rootDir: '/async-storage',
          ...(threshold === undefined ? {} : { threshold }),
        },
      })
        .namespace<string>('wallet')
        .namespace<string>('history')
    }

    const oversizedValues = [
      ['two-byte characters', 'é'.repeat(1_100_000)],
      ['three-byte characters', '€'.repeat(900_000)],
      ['surrogate pairs', '😀'.repeat(600_000)],
    ] as const

    it.each(oversizedValues)('round-trips oversized %s after reopening', async (_, value) => {
      await getInstance().set('large', value)

      expect(await getInstance().get('large')).toBe(value)
    })

    it.each(oversizedValues)(
      'round-trips a mixed batch with oversized %s after reopening',
      async (_, value) => {
        await getInstance().batchSet({ small: 'cached history', large: value })

        expect(await getInstance().batchGet(['small', 'large', 'missing'])).toEqual([
          'cached history',
          value,
          undefined,
        ])
      }
    )

    it.each(['set', 'batchSet'] as const)(
      '%s keeps serialized values at the byte cutoff readable without filesystem access',
      async (method) => {
        const options = {
          rowLimit: 20,
          threshold: 20,
          testFilesystem: {
            ...filesystem,
            writeUtf8: async () => {
              throw new Error('Filesystem unavailable')
            },
          },
        }
        const storage = getInstance(options)
        const values = {
          twoByte: 'é'.repeat(9),
          threeByte: '€'.repeat(6),
          surrogatePairs: '😀'.repeat(4) + 'é',
          escaped: '\\'.repeat(9),
          loneSurrogates: '\uD800'.repeat(3),
        }

        if (method === 'set') {
          for (const [key, value] of Object.entries(values)) {
            await storage.set(key, value)
          }
        } else {
          await storage.batchSet(values)
        }

        expect(await getInstance(options).batchGet(Object.keys(values))).toEqual(
          Object.values(values)
        )
      }
    )

    it.each(['set', 'batchSet'] as const)(
      '%s round-trips serialized values just above the byte cutoff',
      async (method) => {
        const storage = getInstance({ rowLimit: 20, threshold: 20 })
        const values = {
          twoByte: 'é'.repeat(9) + 'a',
          threeByte: '€'.repeat(6) + 'a',
          surrogatePairs: '😀'.repeat(4) + 'éa',
        }

        if (method === 'set') {
          for (const [key, value] of Object.entries(values)) {
            await storage.set(key, value)
          }
        } else {
          await storage.batchSet(values)
        }

        expect(
          await getInstance({ rowLimit: 20, threshold: 20 }).batchGet(Object.keys(values))
        ).toEqual(Object.values(values))
      }
    )
  })

  describe('not exceeding threshold', () => {
    runStorageSpecTestSuite({
      factory: () =>
        createStorageMobile({
          asyncStorage: asMock,
          androidFallback: {
            filesystem: {
              ...filesystem,
              writeUtf8: () => {
                throw new Error('Nothing should be written to the filesystem')
              },
            },
            threshold: 200,
            hashString: (value) => btoa(value),
            rootDir: '/async-storage',
          },
        }),
    })
  })

  describe('exceeding threshold', () => {
    const placeholder = '~'
    const hashString = (value: string) => btoa(value)
    const threshold = 5
    const largeVal = 'a'.repeat(threshold + 1)
    const rootDir = '/async-storage'
    const key = 'identity'
    const largeValPath = `${rootDir}/${hashString(key)}`

    function getInstance() {
      return createStorageMobile({
        asyncStorage: asMock,
        androidFallback: { filesystem, threshold, hashString, rootDir: '/async-storage' },
      })
    }

    describe('threshold 0', () => {
      runStorageSpecTestSuite({
        factory: () =>
          createStorageMobile({
            asyncStorage: asMock,
            androidFallback: { filesystem, threshold: 0, hashString, rootDir: '/async-storage' },
          }),
      })
    })

    it('should write large values to FS', async () => {
      const storage = getInstance()
      await storage.set(key, largeVal)

      const actual = (await asMock.getItem(key)) as string
      expect(JSON.parse(actual)).toEqual(placeholder)
      expect(filesystem._data).toEqual({
        [largeValPath]: JSON.stringify(largeVal),
      })
    })

    describe('directory', () => {
      beforeEach(() => {
        jest.useFakeTimers()
      })

      afterAll(() => {
        jest.useRealTimers()
      })

      it('should create from provided root dir', async () => {
        const storage = getInstance()
        expect(filesystem.mkdirp).toHaveBeenCalledWith(rootDir)

        storage.namespace('nested')

        expect(filesystem.mkdirp).toHaveBeenCalledWith(`${rootDir}/nested`)
      })

      it('should wait for creation to finish before setting', (done) => {
        delayDirectoryCreation(async (storage, resolveCreated, advanceBy) => {
          const setCallback = jest.fn()
          void storage.set(key, largeVal).then(setCallback)

          resolveCreated(100)

          await advanceBy(50)
          expect(setCallback).not.toHaveBeenCalled()
          await advanceBy(60)
          expect(setCallback).toHaveBeenCalled()
          done()
        })
      })

      it('should wait for creation to finish before clearing', (done) => {
        delayDirectoryCreation(async (storage, resolveCreated, advanceBy) => {
          const clearCallback = jest.fn()
          void storage.clear().then(clearCallback)

          resolveCreated(100)

          await advanceBy(50)
          expect(clearCallback).not.toHaveBeenCalled()
          await advanceBy(60)
          expect(clearCallback).toHaveBeenCalled()
          done()
        })
      })

      it('should wait for creation to finish before getting', (done) => {
        void asMock.setItem('something', JSON.stringify(placeholder)).then(() => {
          delayDirectoryCreation(async (storage, resolveCreated, advanceBy) => {
            const getCallback = jest.fn()
            void storage.get('something').then(getCallback)

            resolveCreated(100)

            await advanceBy(50)
            expect(getCallback).not.toHaveBeenCalled()
            await advanceBy(60)
            expect(getCallback).toHaveBeenCalled()
            done()
          })
        })
      })

      it('should wait for creation to finish before deleting', (done) => {
        delayDirectoryCreation(async (storage, resolveCreated, advanceBy) => {
          const deleteCallback = jest.fn()
          void storage.delete('something').then(deleteCallback)

          resolveCreated(100)

          await advanceBy(50)
          expect(deleteCallback).not.toHaveBeenCalled()
          await advanceBy(60)
          expect(deleteCallback).toHaveBeenCalled()
          done()
        })
      })

      function delayDirectoryCreation(
        callback: (
          storage: Storage,
          resolveCreated: (afterMs: number) => void,
          advanceBy: (ms: number) => Promise<void>
        ) => void
      ) {
        let resolveCreated: (value?: unknown) => void = jest.fn()

        ;(filesystem.mkdirp as jest.Mock).mockReturnValue(
          new Promise((resolve) => {
            resolveCreated = () => {
              resolve(true)
            }
          })
        )

        const storage = getInstance()

        const advanceBy = async (ms: number) => jest.advanceTimersByTimeAsync(ms)

        callback(
          storage,
          (afterMs) => {
            setTimeout(resolveCreated, afterMs)
          },
          advanceBy
        )
      }
    })
  })

  describe('sentinel placeholder collision', () => {
    const hashString = (value: string) => btoa(value)
    const rootDir = '/async-storage'
    const key = 'identity'

    function getInstance({ threshold, placeholder }: { threshold: number; placeholder?: string }) {
      return createStorageMobile({
        asyncStorage: asMock,
        androidFallback: { filesystem, threshold, hashString, rootDir, placeholder },
      })
    }

    it('rejects set when value strictly equals the default placeholder (small payload)', async () => {
      // Without the guard, this is the silent-data-loss case: the small-value
      // branch writes only to asyncStorage, but on read the parsed value
      // matches the sentinel and the code falls through to the filesystem,
      // which returns undefined.
      const storage = getInstance({ threshold: 200 })

      await expect(storage.set(key, '~')).rejects.toThrow(/sentinel placeholder/)

      // Nothing should have been persisted.
      expect(await asMock.getItem(key)).toBeNull()
      expect(filesystem._data).toEqual({})
    })

    it('rejects set when value strictly equals the default placeholder (large payload path)', async () => {
      const storage = getInstance({ threshold: 0 })

      await expect(storage.set(key, '~')).rejects.toThrow(/sentinel placeholder/)

      expect(await asMock.getItem(key)).toBeNull()
      expect(filesystem._data).toEqual({})
    })

    it('rejects set when value strictly equals a custom placeholder', async () => {
      const storage = getInstance({ threshold: 200, placeholder: 'OVERFLOW' })

      await expect(storage.set(key, 'OVERFLOW')).rejects.toThrow(/sentinel placeholder/)

      // The default placeholder is no longer reserved when overridden.
      await expect(storage.set(key, '~')).resolves.toBeUndefined()
    })

    it('rejects batchSet when any value strictly equals the placeholder', async () => {
      const storage = getInstance({ threshold: 200 })

      await expect(storage.batchSet({ a: 'fine', [key]: '~' })).rejects.toThrow(
        /sentinel placeholder/
      )
    })

    it('rejects boxed-primitive values that JSON-serialize to the sentinel', async () => {
      // `new String('~') === '~'` is false but `JSON.stringify(new String('~'))`
      // is `"~"`, which on read parses back to the primitive `'~'` and triggers
      // the same silent-loss fallthrough. The serialized-form guard catches it.
      const storage = getInstance({ threshold: 200 })

      // oxlint-disable-next-line unicorn/new-for-builtins, no-new-wrappers
      const boxed = new String('~') as unknown as string
      await expect(storage.set(key, boxed)).rejects.toThrow(/sentinel placeholder/)

      expect(await asMock.getItem(key)).toBeNull()
      expect(filesystem._data).toEqual({})
    })

    it('does not falsely reject values that visually resemble the sentinel', async () => {
      const storage = getInstance({ threshold: 200 })

      // `'"~"'` (the JSON encoding of '~') is a distinct string — its own JSON
      // form is `"\"~\""`, not `"~"` — so it must round-trip without rejection.
      await expect(storage.set(key, '"~"')).resolves.toBeUndefined()
      expect(await storage.get(key)).toBe('"~"')
    })
  })
})
