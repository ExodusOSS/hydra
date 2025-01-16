import { createKeyIdentifierForExodus } from '@exodus/key-ids'
import keychainDefinition, { type SodiumEncryptor } from '@exodus/keychain/module'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id'
import type { Storage } from '@exodus/storage-interface'
import createInMemoryStorage from '@exodus/storage-memory'
import runStorageSpecTestSuite from '@exodus/storage-spec'
import { mnemonicToSeedSync } from 'bip39'
import pDefer from 'p-defer'

import createStorageEncrypted from '../src/index.js'

const SEED = mnemonicToSeedSync(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)
const seedId = getSeedId(SEED)

describe('storage-encrypted', () => {
  let inMemoryStorage: Storage<string>
  let storage: Storage
  let sodiumEncryptor: SodiumEncryptor

  beforeEach(async () => {
    const keychain = keychainDefinition.factory({})
    keychain.addSeed(SEED)
    const keyId = createKeyIdentifierForExodus({ exoType: 'WALLET_INFO' })
    sodiumEncryptor = keychain.sodium.createEncryptor({ keyId })

    inMemoryStorage = createInMemoryStorage()
    storage = createStorageEncrypted({
      storage: inMemoryStorage,
      cryptoFunctionsPromise: Promise.resolve({
        encrypt: (data) => sodiumEncryptor.encryptSecretBox({ seedId, data }),
        decrypt: (data) => sodiumEncryptor.decryptSecretBox({ seedId, data }),
      }),
    })
  })

  runStorageSpecTestSuite({ factory: () => storage })

  describe('crypto function assertions', () => {
    it('should clearly state that encrypt is missing', async () => {
      const cryptoFunctionsPromise = Promise.resolve({
        decrypt: (data: unknown) => sodiumEncryptor.decryptSecretBox({ seedId, data }),
      })

      storage = createStorageEncrypted({
        storage: inMemoryStorage,
        cryptoFunctionsPromise: cryptoFunctionsPromise as never,
      })

      await expect(storage.set('abc', 'deg')).rejects.toThrow(
        new Error('Failed to transform write value for key "abc"', {
          cause: new Error('encrypt not a function'),
        })
      )
    })

    it('should clearly state that decrypt is missing', async () => {
      const cryptoFunctionsPromise = Promise.resolve({
        encrypt: (data: unknown) => sodiumEncryptor.encryptSecretBox({ seedId, data }),
      })

      storage = createStorageEncrypted({
        storage: inMemoryStorage,
        cryptoFunctionsPromise: cryptoFunctionsPromise as never,
      })

      await expect(storage.set('abc', 'deg')).rejects.toThrow(
        new Error('Failed to transform write value for key "abc"', {
          cause: new Error('decrypt not a function'),
        })
      )
    })
  })

  describe('encryption', () => {
    const decrypt = async (value?: string) => {
      if (!value) return
      const decrypted = await sodiumEncryptor.decryptSecretBox({
        seedId,
        data: Buffer.from(value, 'base64'),
      })
      return JSON.parse(decrypted.toString())
    }

    it('should save encrypted data on set', async () => {
      const identity = 'Bruce Wayne'
      await storage.set("batman's identity", identity)

      const stored = await inMemoryStorage.get("batman's identity")

      expect(stored).not.toEqual(identity)
      await expect(decrypt(stored)).resolves.toEqual(identity)
    })

    it('should save encrypted data on batchSet', async () => {
      const expectedPassportNo = 'ABC123'
      const expectedIdentity = 'Bruce Wayne'

      await storage.batchSet({
        "batman's identity": expectedIdentity,
        passportNo: expectedPassportNo,
      })

      const [identity, passportNo] = await inMemoryStorage.batchGet([
        "batman's identity",
        'passportNo',
      ])

      expect(identity).not.toEqual(expectedIdentity)
      expect(passportNo).not.toEqual(expectedPassportNo)
      await expect(decrypt(identity)).resolves.toEqual(expectedIdentity)
      await expect(decrypt(passportNo)).resolves.toEqual(expectedPassportNo)
    })
  })

  describe('storage access', () => {
    const scenarios = [
      { method: 'get', param: "batman's identity", namespace: undefined },
      { method: 'batchGet', param: ["batman's identity"], namespace: undefined },
      { method: 'get', param: "batman's identity", namespace: 'dc-universe' },
      { method: 'batchGet', param: ["batman's identity"], namespace: 'dc-universe' },
    ]

    it.each(scenarios)(
      'should not read from actual storage until unlocked on $method, namespace $namespace',
      async ({ method, param, namespace }) => {
        const cryptoFunctions = pDefer()
        const cryptoFunctionsPromise = cryptoFunctions.promise as never

        const store = new Map()
        const storage = createInMemoryStorage({ store })

        store.get = jest.fn().mockImplementation()

        let encryptedStorage = createStorageEncrypted({ storage, cryptoFunctionsPromise })

        if (namespace) {
          encryptedStorage = encryptedStorage.namespace(namespace)
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const getPromise = encryptedStorage[method](param)

        expect(store.get).toHaveBeenCalledTimes(0)

        cryptoFunctions.resolve({
          encrypt: (data: unknown) => data,
          decrypt: (data: unknown) => data,
        })

        await getPromise

        expect(store.get).toHaveBeenCalledTimes(1)
      }
    )

    it('should allow delete() while locked', async () => {
      const cryptoFunctions = pDefer()
      const cryptoFunctionsPromise = cryptoFunctions.promise as never

      const store = new Map()
      const storage = createInMemoryStorage({ store })
      await storage.set('abc', 'def')

      const encryptedStorage = createStorageEncrypted({ storage, cryptoFunctionsPromise })
      await encryptedStorage.delete('abc')
      await expect(storage.get('abc')).resolves.toBeUndefined()
    })

    test.each([
      {
        name: 'top-level',
        namespace: undefined,
      },
      {
        name: 'namespace',
        namespace: 'some-namespace',
      },
    ])('swallowDecryptionErrors: $name', async ({ namespace }) => {
      const store = new Map()
      const warn = jest.fn()
      const decryptionError = new Error('wrong secret key for the given ciphertext')

      let storage = createInMemoryStorage({ store })
      let encryptedStorage = createStorageEncrypted({
        storage,
        cryptoFunctionsPromise: Promise.resolve({
          encrypt: async (data: Buffer) => data,
          decrypt: async (data: Buffer) => {
            if (data.toString() === '"1"') return data

            throw decryptionError
          },
        }),
        swallowDecryptionErrors: true,
        logger: { warn },
      })

      if (namespace) {
        storage = storage.namespace(namespace)
        encryptedStorage = encryptedStorage.namespace(namespace)
      }

      await storage.set('a', Buffer.from('"1"').toString('base64'))
      await storage.set('b', Buffer.from('"2"').toString('base64'))

      await expect(encryptedStorage.get('a')).resolves.toBe('1')
      await expect(encryptedStorage.get('b')).resolves.toBeUndefined()
      expect(warn.mock.calls[0][0]).toBe(`Failed to decrypt value for key: b`)
      expect(warn.mock.calls[0][1]).toBe(decryptionError)
    })

    test("swallowDecryptionErrors: don't swallow other errors", async () => {
      const storage = createInMemoryStorage()
      const warn = jest.fn()
      const otherError = new Error('boo')
      const encryptedStorage = createStorageEncrypted({
        storage,
        cryptoFunctionsPromise: Promise.resolve({
          encrypt: async (data: Buffer) => data,
          decrypt: async () => {
            throw otherError
          },
        }),
        swallowDecryptionErrors: true,
        logger: { warn },
      })

      await storage.set('a', Buffer.from('"1"').toString('base64'))

      const error = (await encryptedStorage.get('a').catch((err) => err)) as Error
      expect(error.cause).toBe(otherError)
    })
  })
})
