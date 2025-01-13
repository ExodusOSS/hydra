import transformStorage from '../src'
import runStorageSpecTestSuite from '@exodus/storage-spec'
import createInMemoryStorage from '@exodus/storage-memory'
import { Storage } from '@exodus/storage-interface'

describe('transform-storage', () => {
  let inMemoryStorage: Storage<string>
  let storage: Storage<string>

  const onWrite = (value: unknown) => {
    if (value === undefined) throw new Error('nah dont want you')
    return btoa(JSON.stringify(value))
  }

  const onRead = (value?: string) => (value ? JSON.parse(atob(value)) : undefined)

  beforeEach(async () => {
    inMemoryStorage = createInMemoryStorage<string>()
    storage = transformStorage<string, string, string>({
      storage: inMemoryStorage,
      onRead,
      onWrite,
    })
  })

  runStorageSpecTestSuite({ factory: () => storage })

  const asyncOnWrite = (value?: string) =>
    new Promise<string | undefined>((resolve) => {
      setTimeout(() => {
        resolve(onWrite(value))
      }, 2)
    })

  const asyncOnRead = (value?: string) =>
    new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(onRead(value))
      }, 2)
    })

  describe.each([
    ['transformation', () => storage, () => inMemoryStorage, onWrite],
    [
      'transformation (namespaced)',
      () => storage.namespace('nested').namespace('double'),
      () => inMemoryStorage.namespace('nested').namespace('double'),
      onWrite,
    ],
    [
      'transformation (async transformers)',
      () =>
        transformStorage<string, string, string>({
          storage: inMemoryStorage,
          onRead: asyncOnRead,
          onWrite: asyncOnWrite,
        }),
      () => inMemoryStorage,
      asyncOnWrite,
    ],
  ])('%s', (title, getStorage, getMemoryStorage, onWrite) => {
    // onRead transformation is tested through the storage spec test suite
    let theStorage: Storage<string>
    let theMemoryStorage: Storage<string>
    beforeEach(() => {
      theStorage = getStorage()
      theMemoryStorage = getMemoryStorage()
    })

    it('should save transformed data on set', async () => {
      const identity = 'Bruce Wayne'
      await theStorage.set("batman's identity", identity)

      const stored = await theMemoryStorage.get("batman's identity")

      expect(stored).toEqual(await onWrite(identity))
    })

    it('should save encrypted data on batchSet', async () => {
      const expectedPassportNo = 'ABC123'
      const expectedIdentity = 'Bruce Wayne'

      await theStorage.batchSet({
        "batman's identity": expectedIdentity,
        passportNo: expectedPassportNo,
      })

      const [identity, passportNo] = await theMemoryStorage.batchGet([
        "batman's identity",
        'passportNo',
      ])

      expect(identity).toEqual(await onWrite(expectedIdentity))
      expect(passportNo).toEqual(await onWrite(expectedPassportNo))
    })
  })

  it('should allow specifying a read transformer only', async () => {
    const storage = transformStorage({
      storage: inMemoryStorage,
      onRead: () => 'peter',
    })

    await storage.set('name', 'harry')
    await expect(storage.get('name')).resolves.toEqual('peter')
  })

  it('should allow specifying a write transformer only', async () => {
    const storage = transformStorage({
      storage: inMemoryStorage,
      onWrite: () => 'peter',
    })

    await storage.set('name', 'rudolf')
    await expect(storage.get('name')).resolves.toEqual('peter')
  })

  it('should require at least one transformer', () => {
    expect(() =>
      transformStorage({
        storage: inMemoryStorage,
      })
    ).toThrow('one of onRead, onWrite has to be specified')
  })

  it('should rewrite error', async () => {
    const storage: Storage<string> = transformStorage({
      storage: inMemoryStorage,
      onRead: () => {
        throw new Error('UwU')
      },
      onWrite: () => {
        throw new Error('UwU')
      },
    })

    await expect(storage.get('key')).rejects.toThrow('Failed to transform read value for key "key"')

    await expect(storage.batchGet(['key'])).rejects.toThrow(
      'Failed to transform read value for key "key"'
    )

    await expect(storage.set('key', 'value')).rejects.toThrow(
      'Failed to transform write value for key "key"'
    )

    await expect(storage.batchSet({ key: 'value' })).rejects.toThrow(
      'Failed to transform write value for key "key"'
    )
  })
})
