import { createInMemoryAtom, waitUntil } from '@exodus/atoms'
import BJSON from 'buffer-json'
import assert from 'minimalistic-assert'

const validateKey = (key) =>
  assert(key && typeof key === 'string', 'key must be a non-empty string')

const validateAuthenticationPrompt = (value) =>
  assert(
    value === undefined || (typeof value === 'object' && value !== null && !Array.isArray(value)),
    'authenticationPrompt must resolve to an object or undefined'
  )

const createMobileKeystore = ({
  reactNativeKeychain,
  platform,
  options,
  isLockedInitially = false,
  authenticationPrompt,
}) => {
  assert(['ios', 'android'].includes(platform), 'platform must be "ios" or "android"')
  if (typeof authenticationPrompt !== 'function') validateAuthenticationPrompt(authenticationPrompt)

  const getAuthenticationPrompt = () => {
    const prompt =
      typeof authenticationPrompt === 'function' ? authenticationPrompt() : authenticationPrompt
    validateAuthenticationPrompt(prompt)
    return prompt
  }

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
  // https://github.com/ExodusMovement/exodus-hydra/blob/d44ff91676ff84aec61524a631a700a75148045e/features/auth-mobile/module/auth.js#L46-L56
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
    const prompt = getAuthenticationPrompt()
    const value = await reactNativeKeychain.getInternetCredentials(
      key,
      prompt ? { authenticationPrompt: prompt } : {}
    )
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
