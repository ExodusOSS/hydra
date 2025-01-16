import type { Storage } from '@exodus/storage-interface'
import assert from 'minimalistic-assert'
import transformStorage from '@exodus/transform-storage'

import type { CryptoFunctions } from './helpers/types.js'

type ConstructorParameters<T extends Storage> = {
  storage: T
  cryptoFunctionsPromise: Promise<CryptoFunctions>
  swallowDecryptionErrors?: boolean
  logger?: {
    warn: (...args: unknown[]) => void
  }
}

// currently specific to the error thrown by sodium-crypto
// https://github.com/ExodusMovement/libsodium-exodus/blob/9febf6d544529479d3e441139b77022b128da7ff/libsodium-wrappers/libsodium-wrappers.js#L3703
const isDecryptionError = (err: Error) =>
  err.message.includes('wrong secret key for the given ciphertext')

export default function createStorageEncrypted<T extends Storage>({
  storage,
  cryptoFunctionsPromise,
  swallowDecryptionErrors = false,
  logger = console,
}: ConstructorParameters<T>): T {
  assert(cryptoFunctionsPromise, 'missing cryptoFunctionsPromise')

  const cryptoFunctions = cryptoFunctionsPromise.then((functions) => {
    assert(typeof functions.encrypt === 'function', 'encrypt not a function')
    assert(typeof functions.decrypt === 'function', 'decrypt not a function')
    return functions
  })

  const transformOnWrite = async (value: unknown) => {
    if (value === undefined) return

    const { encrypt } = await cryptoFunctions
    const wrapped = JSON.stringify(value)
    const ciphertext = await encrypt(Buffer.from(wrapped))
    return ciphertext.toString('base64')
  }

  const transformOnRead = async (ciphertextB64: string | undefined, key: string) => {
    const { decrypt } = await cryptoFunctions
    if (!ciphertextB64) return

    const ciphertext = Buffer.from(ciphertextB64, 'base64')
    let decrypted
    try {
      decrypted = await decrypt(ciphertext)
    } catch (err) {
      if (swallowDecryptionErrors && isDecryptionError(err as Error)) {
        logger.warn(`Failed to decrypt value for key: ${key}`, err)
        return
      }

      throw err
    }

    return JSON.parse(decrypted.toString())
  }

  const instance = transformStorage({
    storage: storage as never,
    onRead: transformOnRead,
    onWrite: transformOnWrite,
  }) as T

  // TODO: consider using `await-proxy` once deployed
  const interceptGets = (instance: T) => {
    const get = async (key: string) => {
      await cryptoFunctionsPromise
      return instance.get(key)
    }

    const batchGet = async (keys: string[]) => {
      await cryptoFunctionsPromise
      return instance.batchGet(keys)
    }

    const namespace = (prefix: string) => interceptGets(instance.namespace(prefix) as T)

    return { ...instance, get, batchGet, namespace }
  }

  return interceptGets(instance)
}
