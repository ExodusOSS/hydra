import { createInMemoryAtom, waitUntil } from '@exodus/atoms'
import BJSON from 'buffer-json'
import assert from 'minimalistic-assert'

const validateKey = (key) =>
  assert(key && typeof key === 'string', 'key must be a non-empty string')

const createMobileKeystore = ({
  reactNativeKeychain,
  platform,
  options,
  isLockedInitially = false,
}) => {
  assert(['ios', 'android'].includes(platform), 'platform must be "ios" or "android"')

  const defaultSetOptions = {
    accessible: reactNativeKeychain.ACCESSIBLE.WHEN_UNLOCKED,
    ...(platform === 'android'
      ? { securityLevel: reactNativeKeychain.SECURITY_LEVEL.SECURE_SOFTWARE }
      : {}),
    ...options,
  }

  const isKeystoreLockedAtom = createInMemoryAtom({ defaultValue: isLockedInitially })

  const awaitUnlocked = async () =>
    waitUntil({
      atom: isKeystoreLockedAtom,
      predicate: (isLocked) => !isLocked,
    })

  // custom set `opts` example:
  // https://github.com/exodusmovement/exodus-mobile/blob/73dc6a25d94696afdd64e9a3265bebd98507b9d6/src/_local_modules/app/wallet/rn.js#L224-L240
  const setSecret = async (key, value, opts = {}) => {
    await awaitUnlocked()
    validateKey(key)
    assert(value != null, 'value cannot be null or undefined')
    return reactNativeKeychain.setInternetCredentials(key, 'unused', BJSON.stringify(value), {
      ...defaultSetOptions,
      ...opts,
    })
  }

  const getSecret = async (key) => {
    await awaitUnlocked()
    validateKey(key)
    const value = await reactNativeKeychain.getInternetCredentials(key)
    return value === false ? undefined : BJSON.parse(value.password)
  }

  const deleteSecret = async (key) => {
    await awaitUnlocked()
    validateKey(key)
    await reactNativeKeychain.resetInternetCredentials(key)
  }

  const lock = async () => isKeystoreLockedAtom.set(true)

  const unlock = async () => isKeystoreLockedAtom.set(false)

  return {
    getSecret,
    setSecret,
    deleteSecret,
    lock,
    unlock,
  }
}

export default createMobileKeystore
