import _createEncryptedStorage from '@exodus/storage-encrypted'
import pDefer from 'p-defer'

export default function createEncryptedStorage(storage) {
  const deferred = pDefer()
  let isUnlocked = false
  return {
    ..._createEncryptedStorage({
      storage,
      cryptoFunctionsPromise: deferred.promise,
    }),
    unlock: (cryptoFunctions) => {
      deferred.resolve(cryptoFunctions)
      isUnlocked = true
    },
    _isUnlocked: () => isUnlocked,
    _storage: storage,
  }
}
