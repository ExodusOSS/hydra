import KeyIdentifier from '@exodus/key-identifier'
import { createKeyIdentifierForExodus } from '@exodus/key-ids'
import keychainDefinition from '@exodus/keychain/module'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id.js'
import createInMemoryStorage from '@exodus/storage-memory'
import suite from '@exodus/storage-spec'
import { mnemonicToSeedSync } from 'bip39'

import createEncryptedStorage from '../encrypted-storage'

const SEED = mnemonicToSeedSync(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)
const seedId = getSeedId(SEED)

describe('encrypted storage', () => {
  const keychain = keychainDefinition.factory()
  keychain.addSeed(SEED)

  const keyId = createKeyIdentifierForExodus({ exoType: 'WALLET_INFO' })
  const sodiumEncryptor = keychain.createSodiumEncryptor(keyId)
  const otherSodiumEncryptor = keychain.createSodiumEncryptor(
    new KeyIdentifier({
      derivationAlgorithm: 'BIP32',
      derivationPath: `m/123'/0'/0`,
      keyType: 'nacl',
    })
  )

  suite({
    factory: () => {
      const storage = createEncryptedStorage({
        unsafeStorage: createInMemoryStorage(),
      })

      storage.unlock({
        encrypt: (data) => sodiumEncryptor.encryptSecretBox({ seedId, data }),
        decrypt: (data) => sodiumEncryptor.decryptSecretBox({ seedId, data }),
      })

      return storage
    },
  })

  test('swallow decryption errors', async () => {
    const unsafeStorage = createInMemoryStorage()
    const dummyLogger = { warn: jest.fn() }
    const storageA = createEncryptedStorage({ unsafeStorage, logger: dummyLogger })
    const storageB = createEncryptedStorage({ unsafeStorage, logger: dummyLogger })
    storageA.unlock({
      encrypt: (data) => sodiumEncryptor.encryptSecretBox({ seedId, data }),
      decrypt: (data) => sodiumEncryptor.decryptSecretBox({ seedId, data }),
    })

    storageB.unlock({
      encrypt: (data) => otherSodiumEncryptor.encryptSecretBox({ seedId, data }),
      decrypt: (data) => otherSodiumEncryptor.decryptSecretBox({ seedId, data }),
    })

    await storageA.set('a', 1)
    await unsafeStorage.set('b', 'invalid')
    await expect(storageB.get('a')).resolves.toEqual(undefined)
    await expect(storageB.get('b')).rejects.toThrow() // some other error about invalid ciphertext length
  })
})
