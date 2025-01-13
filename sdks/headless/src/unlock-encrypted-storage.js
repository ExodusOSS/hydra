import { EXODUS_KEY_IDS } from '@exodus/key-ids'
import sodium from '@exodus/sodium-crypto'

const WALLET_INFO_KEY = EXODUS_KEY_IDS.WALLET_INFO

const createUnlockEncryptedStorage = ({ keychain, wallet }) => {
  return async (encryptedStorage) => {
    // Fusion might write on storage even after keychain is locked, so we get keys
    // directly instead of creating encryptor that does not preserves it anymore
    const primarySeedId = await wallet.getPrimarySeedId()
    const { privateKey } = await keychain.exportKey({
      seedId: primarySeedId,
      keyId: WALLET_INFO_KEY,
      exportPrivate: true,
    })

    await encryptedStorage.unlock({
      encrypt: (data) => sodium.encryptSecret(data, privateKey),
      decrypt: (data) => sodium.decryptSecret(data, privateKey),
    })
  }
}

const unlockEncryptedStorageDefinition = {
  id: 'unlockEncryptedStorage',
  type: 'module',
  factory: createUnlockEncryptedStorage,
  dependencies: ['keychain', 'wallet'],
  public: true,
}

export default unlockEncryptedStorageDefinition
