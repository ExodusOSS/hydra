import { mock } from 'node:test'

import type { Storage } from '@exodus/storage-interface'
import runStorageSpecTestSuite from '@exodus/storage-spec'
import asMock from '@react-native-async-storage/async-storage/jest/async-storage-mock'

import createInMemoryFS from './helpers/filesystem.js'
import type { TestFilesystem } from './helpers/types'

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

const { default: createStorageMobile } = await import('../src/index.android')

describe('storage-mobile', () => {
  let filesystem: TestFilesystem

  beforeEach(async () => {
    await asMock.clear()
    filesystem = createInMemoryFS()
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
          storage.set(key, largeVal).then(setCallback)

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
          storage.clear().then(clearCallback)

          resolveCreated(100)

          await advanceBy(50)
          expect(clearCallback).not.toHaveBeenCalled()
          await advanceBy(60)
          expect(clearCallback).toHaveBeenCalled()
          done()
        })
      })

      it('should wait for creation to finish before getting', (done) => {
        asMock.setItem('something', JSON.stringify(placeholder)).then(() => {
          delayDirectoryCreation(async (storage, resolveCreated, advanceBy) => {
            const getCallback = jest.fn()
            storage.get('something').then(getCallback)

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
          storage.delete('something').then(deleteCallback)

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
})
