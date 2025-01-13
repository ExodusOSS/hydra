import _createEncryptedStorage from '@exodus/storage-encrypted'
import createInMemoryStorage from '@exodus/storage-memory'
import pDefer from 'p-defer'

export default function createEncryptedStorage() {
  const deferred = pDefer()
  let isUnlocked = false
  const _storage = createInMemoryStorage()
  return {
    ..._createEncryptedStorage({
      storage: _storage,
      cryptoFunctionsPromise: deferred.promise,
    }),
    unlock: (cryptoFunctions) => {
      deferred.resolve(cryptoFunctions)
      isUnlocked = true
    },
    _isUnlocked: () => isUnlocked,
    _storage,
  }
}
