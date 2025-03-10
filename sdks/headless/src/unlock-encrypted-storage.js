import { EXODUS_KEY_IDS } from '@exodus/key-ids'

/**
 * @typedef {import('@exodus/cached-sodium-encryptor/module').CachedSodiumEncryptor} CachedSodiumEncryptor
 */

/**
 * @param {object} dependencies
 * @param {CachedSodiumEncryptor} dependencies.cachedSodiumEncryptor
 * @param {object} dependencies.wallet
 */
const createUnlockEncryptedStorage = ({ cachedSodiumEncryptor, wallet }) => {
  return async (encryptedStorage) => {
    const seedId = await wallet.getPrimarySeedId()
    const keyId = EXODUS_KEY_IDS.WALLET_INFO

    await encryptedStorage.unlock({
      encrypt: (data) => cachedSodiumEncryptor.encryptSecretBox({ data, seedId, keyId }),
      decrypt: (data) => cachedSodiumEncryptor.decryptSecretBox({ data, seedId, keyId }),
    })
  }
}

const unlockEncryptedStorageDefinition = {
  id: 'unlockEncryptedStorage',
  type: 'module',
  factory: createUnlockEncryptedStorage,
  dependencies: ['wallet', 'cachedSodiumEncryptor'],
  public: true,
}

export default unlockEncryptedStorageDefinition
