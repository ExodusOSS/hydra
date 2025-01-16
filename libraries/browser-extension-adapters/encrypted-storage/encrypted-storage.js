import createStorageEncrypted from '@exodus/storage-encrypted'
import assert from 'minimalistic-assert'
import pDefer from 'p-defer'

const createEncryptedStorage = ({
  unsafeStorage,
  swallowDecryptionErrors = true,
  logger = console,
}) => {
  assert(unsafeStorage, `missing storage`)

  const { promise, resolve } = pDefer()

  const instance = createStorageEncrypted({
    storage: unsafeStorage,
    cryptoFunctionsPromise: promise,
    swallowDecryptionErrors,
    logger,
  })

  return { ...instance, unlock: resolve }
}

export default createEncryptedStorage
