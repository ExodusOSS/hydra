import { createInMemoryAtom, createStorageAtomFactory } from '@exodus/atoms'

import {
  ACCESS_CONTROL_BIOMETRY_CURRENT_SET,
  ACCESS_CONTROL_USER_PRESENCE,
  ACCESSIBLE_WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  AUTH_KEYSTORE_BIO_AUTH_KEY,
  AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY,
  AUTH_KEYSTORE_DEVICE_AUTH_KEY,
  AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY,
  AUTH_KEYSTORE_PIN_KEY,
  AUTHENTICATION_TYPE,
  defaultConfig,
} from '../../constants.js'
import authDefinition from '../auth.js'
import {
  DeviceAuthenticationUnavailableError,
  InvalidPasscodeLengthError,
} from '../utils/errors.js'

const key = (k) => `${defaultConfig.keyPrefix}${k}`

const keychainError = (message, code) => Object.assign(new Error(message), { code })

const defer = () => {
  let resolvePromise
  const promise = new Promise((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

describe('Auth module', () => {
  let auth
  let keystore
  let authAtom
  let logger
  let eventLog
  let eventLogAtom
  let biometry
  let canUseDeviceAuth

  beforeEach(async () => {
    const secrets = new Map()
    keystore = {
      getSecret: jest.fn(async (key) => secrets.get(key)),
      setSecret: jest.fn(async (key, value) => secrets.set(key, value)),
      deleteSecret: jest.fn(async (key) => secrets.delete(key)),
    }

    authAtom = createInMemoryAtom({ defaultValue: {} })

    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    eventLogAtom = createInMemoryAtom({ defaultValue: [] })
    eventLog = {
      record: jest.fn((data) => eventLogAtom.set((events) => [...events, data])),
    }

    biometry = {
      get: jest.fn(async () => null),
    }

    canUseDeviceAuth = jest.fn(async () => true)

    auth = createAuth()
  })

  const createAuth = () =>
    authDefinition.factory({
      keystore,
      authAtom,
      logger,
      eventLog,
      eventLogAtom,
      biometry,
      canUseDeviceAuth,
    })

  const recordedEvents = () => eventLog.record.mock.calls.map(([{ event }]) => event)

  describe('clear', () => {
    test('removes PIN, disables bio auth, removes trigger, and records event', async () => {
      biometry.get.mockResolvedValue('Touch ID')
      await auth.load()
      await auth.setPin('123456')
      await auth.enableBioAuth()

      await auth.clear()

      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_PIN_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY))
      expect(await authAtom.get()).toMatchObject({
        hasPin: false,
        hasBioAuth: false,
        hasDeviceAuth: false,
      })
      expect(eventLog.record).toHaveBeenCalledWith({ event: 'all_auth_removed' })
    })
  })

  describe('disableBioAuth', () => {
    test('deletes bio auth and device auth secrets and updates atom', async () => {
      biometry.get.mockResolvedValue('Touch ID')
      await auth.load()
      await auth.enableBioAuth()

      await auth.disableBioAuth()

      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY))
      expect(await authAtom.get()).toMatchObject({ hasBioAuth: false, hasDeviceAuth: false })
    })
  })

  describe('enableBioAuth', () => {
    test('stores bio auth secrets with correct options and updates atom', async () => {
      biometry.get.mockResolvedValue('Touch ID')
      await auth.load()

      await auth.enableBioAuth()

      expect(keystore.setSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_KEY), true, {
        accessible: ACCESSIBLE_WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      })
      expect(keystore.setSecret).toHaveBeenCalledWith(
        key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY),
        true,
        {
          accessible: ACCESSIBLE_WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          accessControl: ACCESS_CONTROL_BIOMETRY_CURRENT_SET,
        }
      )
      expect(await authAtom.get()).toMatchObject({ hasBioAuth: true })
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY))
    })

    test('stores device auth secrets when fallbackToDevicePin is true', async () => {
      biometry.get.mockResolvedValue('Touch ID')
      await auth.load()

      await auth.enableBioAuth({ fallbackToDevicePin: true })

      expect(canUseDeviceAuth).toHaveBeenCalledWith({
        authenticationType: AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
      })
      expect(keystore.setSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true, {
        accessible: ACCESSIBLE_WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      })
      expect(keystore.setSecret).toHaveBeenCalledWith(
        key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY),
        true,
        {
          accessible: ACCESSIBLE_WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          accessControl: ACCESS_CONTROL_USER_PRESENCE,
        }
      )
      expect(await authAtom.get()).toMatchObject({ hasDeviceAuth: true })
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
    })

    test('throws DeviceAuthenticationUnavailableError when device auth unavailable', async () => {
      canUseDeviceAuth.mockResolvedValue(false)

      await expect(auth.enableBioAuth({ fallbackToDevicePin: true })).rejects.toThrow(
        DeviceAuthenticationUnavailableError
      )
      expect(keystore.setSecret).not.toHaveBeenCalled()
    })

    test('writes the bio auth trigger key before the flag key', async () => {
      biometry.get.mockResolvedValue('Touch ID')
      await auth.load()

      await auth.enableBioAuth()

      const setKeys = keystore.setSecret.mock.calls.map(([k]) => k)
      expect(setKeys.indexOf(key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))).toBeLessThan(
        setKeys.indexOf(key(AUTH_KEYSTORE_BIO_AUTH_KEY))
      )
    })

    test('writes the device auth trigger key before the flag key', async () => {
      biometry.get.mockResolvedValue('Touch ID')
      await auth.load()

      await auth.enableBioAuth({ fallbackToDevicePin: true })

      const setKeys = keystore.setSecret.mock.calls.map(([k]) => k)
      expect(setKeys.indexOf(key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY))).toBeLessThan(
        setKeys.indexOf(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))
      )
    })

    test('does not write the flag key when the trigger write fails', async () => {
      biometry.get.mockResolvedValue('Touch ID')
      await auth.load()

      keystore.setSecret.mockImplementation(async (k) => {
        if (k === key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY)) throw new Error('E_CRYPTO_FAILED')
      })

      await expect(auth.enableBioAuth()).rejects.toThrow('E_CRYPTO_FAILED')

      const setKeys = keystore.setSecret.mock.calls.map(([k]) => k)
      expect(setKeys).not.toContain(key(AUTH_KEYSTORE_BIO_AUTH_KEY))
    })
  })

  describe('auth operation serialization', () => {
    test('does not overwrite an enable operation with an earlier flag read', async () => {
      await auth.load()
      const pendingRead = defer()
      keystore.getSecret.mockImplementationOnce(() => pendingRead.promise)

      const refreshing = auth.refreshDeviceAuth()
      await new Promise((resolve) => setImmediate(resolve))
      const enabling = auth.enableBioAuth({ fallbackToDevicePin: true })
      await new Promise((resolve) => setImmediate(resolve))

      pendingRead.resolve()
      await Promise.all([refreshing, enabling])

      expect(await keystore.getSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))).toBe(true)
      expect(await authAtom.get()).toMatchObject({
        deviceAuthEnabled: true,
        hasDeviceAuth: true,
        shouldAuthenticate: true,
      })
    })

    test('does not overwrite a disable operation with an earlier availability probe', async () => {
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)
      await auth.load()
      const pendingProbe = defer()
      canUseDeviceAuth.mockImplementationOnce(() => pendingProbe.promise)

      const refreshing = auth.refreshDeviceAuth()
      await new Promise((resolve) => setImmediate(resolve))
      const disabling = auth.disableBioAuth()
      await new Promise((resolve) => setImmediate(resolve))

      pendingProbe.resolve(true)
      await Promise.all([refreshing, disabling])

      expect(await keystore.getSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))).toBeUndefined()
      expect(await authAtom.get()).toMatchObject({
        deviceAuthEnabled: false,
        hasDeviceAuth: false,
        shouldAuthenticate: false,
      })
    })

    test('refreshes the flag after an in-flight enable operation completes', async () => {
      await auth.load()
      const pendingWrite = defer()
      keystore.setSecret.mockImplementationOnce(() => pendingWrite.promise)
      canUseDeviceAuth.mockResolvedValueOnce(true).mockResolvedValue(false)

      const enabling = auth.enableBioAuth({ fallbackToDevicePin: true })
      await new Promise((resolve) => setImmediate(resolve))
      const refreshing = auth.refreshDeviceAuth()
      await new Promise((resolve) => setImmediate(resolve))

      pendingWrite.resolve()
      await Promise.all([enabling, refreshing])

      expect(await authAtom.get()).toMatchObject({
        deviceAuthEnabled: true,
        hasDeviceAuth: true,
        deviceAuthUnavailable: true,
        shouldAuthenticate: true,
      })
    })

    test('waits for an enable operation before disabling auth', async () => {
      const pendingWrite = defer()
      keystore.setSecret.mockImplementationOnce(() => pendingWrite.promise)

      const enabling = auth.enableBioAuth()
      const disabling = auth.disableBioAuth()
      await new Promise((resolve) => setImmediate(resolve))

      expect(keystore.setSecret).toHaveBeenCalledTimes(1)
      expect(keystore.deleteSecret).not.toHaveBeenCalled()

      pendingWrite.resolve()
      await enabling
      await disabling

      expect(await authAtom.get()).toMatchObject({ hasBioAuth: false, hasDeviceAuth: false })
    })

    test('waits for an enable operation before setting a pin', async () => {
      const pendingWrite = defer()
      keystore.setSecret.mockImplementationOnce(() => pendingWrite.promise)

      const enabling = auth.enableBioAuth()
      const settingPin = auth.setPin('123456')
      await new Promise((resolve) => setImmediate(resolve))

      expect(keystore.setSecret).toHaveBeenCalledTimes(1)

      pendingWrite.resolve()
      await enabling
      await settingPin

      expect(keystore.setSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_PIN_KEY), '123456')
      expect(await authAtom.get()).toMatchObject({ hasPin: true })
    })

    test('clears authentication without re-entering the operation queue', async () => {
      await auth.setPin('123456')

      await expect(auth.clear()).resolves.toBeUndefined()

      expect(await authAtom.get()).toMatchObject({
        hasBioAuth: false,
        hasDeviceAuth: false,
        hasPin: false,
      })
    })

    test('continues the queue after an operation rejects', async () => {
      keystore.setSecret.mockRejectedValueOnce(new Error('write failed'))

      const enabling = auth.enableBioAuth()
      const disabling = auth.disableBioAuth()

      await expect(enabling).rejects.toThrow('write failed')
      await expect(disabling).resolves.toBeUndefined()
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))
    })

    test('prefers biometric auth when both stored mode flags are present', async () => {
      biometry.get.mockResolvedValue('Touch ID')
      await keystore.setSecret(key(AUTH_KEYSTORE_BIO_AUTH_KEY), true)
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)

      await auth.load()

      expect(await authAtom.get()).toMatchObject({ hasBioAuth: true, hasDeviceAuth: false })
    })
  })

  describe('getBioAuthTrigger', () => {
    test('returns bio auth trigger value when set', async () => {
      biometry.get.mockResolvedValue('Touch ID')
      await auth.load()
      await auth.enableBioAuth()

      const result = await auth.getBioAuthTrigger()

      expect(keystore.getSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY))
      expect(keystore.getSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
      expect(result).toBe(true)
    })

    test('returns undefined when not set', async () => {
      const result = await auth.getBioAuthTrigger()

      expect(keystore.getSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY))
      expect(keystore.getSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
      expect(result).toBeUndefined()
    })
  })

  describe('hasPin', () => {
    test('returns false when no PIN is set', async () => {
      const result = await auth.hasPin()
      expect(result).toBe(false)
    })

    test('returns true when PIN is set', async () => {
      await keystore.setSecret(key(AUTH_KEYSTORE_PIN_KEY), '123456')
      const result = await auth.hasPin()
      expect(result).toBe(true)
    })
  })

  describe('isCorrectPin', () => {
    test('returns true for correct PIN, false otherwise', async () => {
      expect(await auth.isCorrectPin('123456')).toBe(false)
      await auth.setPin('123456')
      expect(await auth.isCorrectPin('123456')).toBe(true)
      expect(await auth.isCorrectPin('654321')).toBe(false)
    })
  })

  describe('load', () => {
    test('refresh does not publish partial auth state after a failed load and recovers all credentials', async () => {
      authAtom = createInMemoryAtom()
      auth = createAuth()
      biometry.get.mockResolvedValue('Face ID')
      await keystore.setSecret(key(AUTH_KEYSTORE_PIN_KEY), '123456')
      await keystore.setSecret(key(AUTH_KEYSTORE_BIO_AUTH_KEY), true)

      const getSecret = keystore.getSecret.getMockImplementation()
      keystore.getSecret.mockImplementation(async (k) => {
        if (k === key(AUTH_KEYSTORE_PIN_KEY)) throw new Error('Keystore is locked')
        return getSecret(k)
      })

      let publishedAuth
      const readingAuth = authAtom.get().then((value) => {
        publishedAuth = value
      })

      await expect(auth.load()).rejects.toThrow('Keystore is locked')
      await auth.refreshDeviceAuth()
      await new Promise((resolve) => setImmediate(resolve))

      expect(publishedAuth).toBeUndefined()

      keystore.getSecret.mockImplementation(getSecret)
      await auth.refreshDeviceAuth()
      await readingAuth

      expect(publishedAuth).toMatchObject({
        hasPin: true,
        hasBioAuth: true,
        biometry: 'Face ID',
        hasDeviceAuth: false,
        shouldAuthenticate: true,
      })
    })

    test('loads auth state with no PIN and no biometry', async () => {
      await auth.load()

      expect(await authAtom.get()).toMatchObject({
        hasPin: false,
        hasBioAuth: false,
        biometry: null,
        shouldAuthenticate: false,
      })
    })

    test('loads auth state with PIN', async () => {
      await keystore.setSecret(key(AUTH_KEYSTORE_PIN_KEY), '123456')

      await auth.load()

      expect(await authAtom.get()).toMatchObject({
        hasPin: true,
        shouldAuthenticate: true,
      })
    })

    test('loads auth state with bio auth and biometry', async () => {
      biometry.get.mockResolvedValue('Face ID')
      await keystore.setSecret(key(AUTH_KEYSTORE_BIO_AUTH_KEY), true)

      await auth.load()

      expect(await authAtom.get()).toMatchObject({
        hasBioAuth: true,
        biometry: 'Face ID',
        shouldAuthenticate: true,
      })
    })

    test('hasBioAuth is false when bio auth enabled but no biometry available', async () => {
      await keystore.setSecret(key(AUTH_KEYSTORE_BIO_AUTH_KEY), true)

      await auth.load()

      expect(await authAtom.get()).toMatchObject({
        hasBioAuth: false,
        biometry: null,
      })
    })

    test('loads auth state with device auth enabled', async () => {
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)

      await auth.load()

      expect(await authAtom.get()).toMatchObject({
        hasDeviceAuth: true,
        deviceAuthUnavailable: false,
        shouldAuthenticate: true,
      })
    })

    test('requires authentication when device auth is enabled but the availability probe returns false', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)

      await auth.load()

      expect(await authAtom.get()).toMatchObject({
        deviceAuthEnabled: true,
        hasDeviceAuth: true,
        deviceAuthUnavailable: true,
        shouldAuthenticate: true,
      })
      expect(await keystore.getSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))).toBe(true)
      expect(eventLog.record).toHaveBeenCalledWith({ event: 'device_auth_unavailable' })
    })

    test('deviceAuthUnavailable is false when device auth was never enabled', async () => {
      await auth.load()

      expect(await authAtom.get()).toMatchObject({
        deviceAuthEnabled: false,
        hasDeviceAuth: false,
        deviceAuthUnavailable: false,
        shouldAuthenticate: false,
      })
    })

    test('records device_auth_unavailable when the atom has no value yet', async () => {
      authAtom = createInMemoryAtom()
      auth = createAuth()
      canUseDeviceAuth.mockResolvedValue(false)
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)

      await auth.load()

      expect(await authAtom.get()).toMatchObject({
        hasDeviceAuth: true,
        deviceAuthUnavailable: true,
        shouldAuthenticate: true,
      })
      expect(eventLog.record).toHaveBeenCalledWith({ event: 'device_auth_unavailable' })
    })

    test('records device_auth_unavailable once, not on every load while it stays unavailable', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)

      await auth.load()
      await auth.load()

      expect(eventLog.record).toHaveBeenCalledTimes(1)
    })

    test('records device_auth_unavailable once across cold starts sharing one event log', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)

      await auth.load()
      authAtom = createInMemoryAtom()
      await createAuth().load()
      authAtom = createInMemoryAtom()
      await createAuth().load()

      expect(eventLog.record).toHaveBeenCalledTimes(1)
    })

    test('records device_auth_restored once the device can authenticate again', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)
      await auth.load()
      canUseDeviceAuth.mockResolvedValue(true)

      authAtom = createInMemoryAtom()
      await createAuth().load()

      expect(recordedEvents()).toEqual(['device_auth_unavailable', 'device_auth_restored'])
    })

    test('does not record device_auth_unavailable when the device can authenticate', async () => {
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)

      await auth.load()

      expect(eventLog.record).not.toHaveBeenCalled()
    })

    test('does not record anything when the availability probe fails', async () => {
      canUseDeviceAuth.mockRejectedValue(new Error('LAContext unavailable'))
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)

      await auth.load()

      expect(eventLog.record).not.toHaveBeenCalled()
    })

    test('logs and still resolves when recording the event fails', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      eventLog.record.mockRejectedValue(new Error('Storage unavailable'))
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)

      await expect(auth.load()).resolves.toBeUndefined()

      expect(logger.warn).toHaveBeenCalledWith(
        'recording device auth availability failed',
        'Storage unavailable'
      )
      expect(await authAtom.get()).toMatchObject({
        hasDeviceAuth: true,
        deviceAuthUnavailable: true,
        shouldAuthenticate: true,
      })
    })

    test('logs and still resolves when reading the event log fails', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      eventLogAtom = createStorageAtomFactory({
        storage: { get: jest.fn().mockRejectedValue(new Error('Storage unavailable')) },
      })({ key: 'events', defaultValue: [] })
      auth = createAuth()
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)

      await expect(auth.load()).resolves.toBeUndefined()

      expect(logger.warn).toHaveBeenCalledWith(
        'recording device auth availability failed',
        'Storage unavailable'
      )
    })

    test('keeps device auth on and logs when the availability probe fails', async () => {
      canUseDeviceAuth.mockRejectedValue(new Error('LAContext unavailable'))
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)

      await expect(auth.load()).resolves.toBeUndefined()

      expect(logger.warn).toHaveBeenCalledWith(
        'checking device auth availability failed',
        'LAContext unavailable'
      )
      expect(await authAtom.get()).toMatchObject({
        hasDeviceAuth: true,
        shouldAuthenticate: true,
      })
    })

    test('does not probe device auth availability when the flag is not set', async () => {
      await auth.load()

      expect(canUseDeviceAuth).not.toHaveBeenCalled()
      expect(eventLog.record).not.toHaveBeenCalled()
    })

    test('treats an undecryptable device auth flag as enabled and rewrites it', async () => {
      keystore.getSecret.mockImplementation(async (k) => {
        if (k === key(AUTH_KEYSTORE_DEVICE_AUTH_KEY)) {
          throw keychainError('Could not decrypt data', 'E_CRYPTO_FAILED')
        }
      })

      await auth.load()

      expect(keystore.setSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true, {
        accessible: ACCESSIBLE_WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      })
      expect(await authAtom.get()).toMatchObject({
        hasDeviceAuth: true,
        shouldAuthenticate: true,
      })
    })

    test('treats an undecryptable bio auth flag as enabled and rewrites it', async () => {
      biometry.get.mockResolvedValue('Face ID')
      keystore.getSecret.mockImplementation(async (k) => {
        if (k === key(AUTH_KEYSTORE_BIO_AUTH_KEY)) {
          throw keychainError('Could not decrypt data', 'E_CRYPTO_FAILED')
        }
      })

      await auth.load()

      expect(keystore.setSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_KEY), true, {
        accessible: ACCESSIBLE_WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      })
      expect(await authAtom.get()).toMatchObject({
        hasBioAuth: true,
        shouldAuthenticate: true,
      })
    })

    test('logs and still resolves when rewriting the undecryptable flag fails', async () => {
      keystore.getSecret.mockImplementation(async (k) => {
        if (k === key(AUTH_KEYSTORE_DEVICE_AUTH_KEY)) {
          throw keychainError('Could not decrypt data', 'E_CRYPTO_FAILED')
        }
      })
      keystore.setSecret.mockRejectedValue(new Error('Keystore unavailable'))

      await expect(auth.load()).resolves.toBeUndefined()

      expect(logger.error).toHaveBeenCalledWith(
        `rewriting ${AUTH_KEYSTORE_DEVICE_AUTH_KEY} failed`,
        'Keystore unavailable'
      )
      expect(await authAtom.get()).toMatchObject({ hasDeviceAuth: true })
    })

    test('rejects when a flag read fails with another code', async () => {
      keystore.getSecret.mockImplementation(async (k) => {
        if (k === key(AUTH_KEYSTORE_DEVICE_AUTH_KEY)) {
          throw keychainError('Keystore is locked', 'E_KEYSTORE_ACCESS_ERROR')
        }
      })

      await expect(auth.load()).rejects.toThrow('Keystore is locked')
      expect(keystore.setSecret).not.toHaveBeenCalled()
    })
  })

  describe('device auth probe timeouts', () => {
    beforeEach(() => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test('finishes loading with authentication required when the native probe never settles', async () => {
      authAtom = createInMemoryAtom()
      auth = createAuth()
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)
      canUseDeviceAuth.mockReturnValue(defer().promise)

      let loaded = false
      const loading = auth.load().then(() => {
        loaded = true
      })
      await jest.advanceTimersByTimeAsync(5000)

      expect(loaded).toBe(true)
      await loading
      expect(await authAtom.get()).toMatchObject({
        hasDeviceAuth: true,
        deviceAuthUnavailable: false,
        shouldAuthenticate: true,
      })
      expect(await eventLogAtom.get()).toEqual([])
    })

    test('preserves availability, releases queued mutations, and ignores a late probe result', async () => {
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)
      canUseDeviceAuth.mockResolvedValue(false)
      await auth.load()

      const pendingProbe = defer()
      canUseDeviceAuth.mockReturnValueOnce(pendingProbe.promise)
      let refreshed = false
      let pinSet = false
      const refreshing = auth.refreshDeviceAuth().then(() => {
        refreshed = true
      })
      const settingPin = auth.setPin('123456').then(() => {
        pinSet = true
      })
      await jest.advanceTimersByTimeAsync(5000)

      expect(refreshed).toBe(true)
      expect(pinSet).toBe(true)
      await Promise.all([refreshing, settingPin])
      expect(await authAtom.get()).toMatchObject({
        hasPin: true,
        hasDeviceAuth: true,
        deviceAuthUnavailable: true,
        shouldAuthenticate: true,
      })

      await auth.clear()
      const eventsAfterClear = await eventLogAtom.get()
      pendingProbe.resolve(false)
      await jest.advanceTimersByTimeAsync(0)

      expect(await authAtom.get()).toMatchObject({
        hasPin: false,
        hasDeviceAuth: false,
        deviceAuthUnavailable: false,
        shouldAuthenticate: false,
      })
      expect(await eventLogAtom.get()).toEqual(eventsAfterClear)
    })

    test('rejects a hanging enable check without enabling auth or blocking a queued PIN change', async () => {
      await auth.load()
      canUseDeviceAuth.mockReturnValue(defer().promise)

      let enableError
      let pinSet = false
      const enabling = auth.enableBioAuth({ fallbackToDevicePin: true }).catch((error) => {
        enableError = error
      })
      const settingPin = auth.setPin('123456').then(() => {
        pinSet = true
      })
      await jest.advanceTimersByTimeAsync(5000)

      expect(enableError).toBeInstanceOf(Error)
      expect(pinSet).toBe(true)
      await Promise.all([enabling, settingPin])
      expect(await keystore.getSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))).toBeUndefined()
      expect(await authAtom.get()).toMatchObject({
        hasPin: true,
        hasDeviceAuth: false,
        shouldAuthenticate: true,
      })
    })
  })

  describe('refreshDeviceAuth', () => {
    beforeEach(async () => {
      await keystore.setSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), true)
      await auth.load()
      canUseDeviceAuth.mockClear()
      logger.warn.mockClear()
    })

    test('keeps requiring authentication when a refresh reports device auth unavailable', async () => {
      canUseDeviceAuth.mockResolvedValue(false)

      await auth.refreshDeviceAuth()

      expect(await authAtom.get()).toMatchObject({
        hasDeviceAuth: true,
        deviceAuthUnavailable: true,
        shouldAuthenticate: true,
      })
      expect(await keystore.getSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))).toBe(true)
    })

    test('clears deviceAuthUnavailable when the user turns device auth off', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      await auth.refreshDeviceAuth()

      await auth.disableBioAuth()

      expect(await authAtom.get()).toMatchObject({
        deviceAuthEnabled: false,
        hasDeviceAuth: false,
        deviceAuthUnavailable: false,
        shouldAuthenticate: false,
      })
    })

    test('clears deviceAuthUnavailable when the user re-enables device auth', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      await auth.refreshDeviceAuth()
      canUseDeviceAuth.mockResolvedValue(true)

      await auth.enableBioAuth({ fallbackToDevicePin: true })

      expect(await authAtom.get()).toMatchObject({
        hasDeviceAuth: true,
        deviceAuthUnavailable: false,
      })
    })

    test('leaves device auth on when the device can authenticate', async () => {
      await auth.refreshDeviceAuth()

      expect(await authAtom.get()).toMatchObject({
        hasDeviceAuth: true,
        shouldAuthenticate: true,
      })
    })

    test('clears unavailability and still requires authentication once the device can authenticate again', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      await auth.refreshDeviceAuth()
      canUseDeviceAuth.mockResolvedValue(true)

      await auth.refreshDeviceAuth()

      expect(await authAtom.get()).toMatchObject({
        hasDeviceAuth: true,
        deviceAuthUnavailable: false,
        shouldAuthenticate: true,
      })
    })

    test('records each drop and each restore of device auth', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      await auth.refreshDeviceAuth()
      canUseDeviceAuth.mockResolvedValue(true)
      await auth.refreshDeviceAuth()
      canUseDeviceAuth.mockResolvedValue(false)

      await auth.refreshDeviceAuth()

      expect(recordedEvents()).toEqual([
        'device_auth_unavailable',
        'device_auth_restored',
        'device_auth_unavailable',
      ])
    })

    test('records one drop when concurrent refreshes overlap a pending event write', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      const pendingWrite = defer()
      const record = eventLog.record.getMockImplementation()
      eventLog.record.mockImplementationOnce(async (event) => {
        await pendingWrite.promise
        await record(event)
      })

      const firstRefresh = auth.refreshDeviceAuth()
      await new Promise((resolve) => setImmediate(resolve))
      const secondRefresh = auth.refreshDeviceAuth()
      await new Promise((resolve) => setImmediate(resolve))

      pendingWrite.resolve()
      await Promise.all([firstRefresh, secondRefresh])

      expect(await eventLogAtom.get()).toEqual([{ event: 'device_auth_unavailable' }])
    })

    test('records restoration on explicit enabling and records the next drop', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      await auth.refreshDeviceAuth()
      canUseDeviceAuth.mockResolvedValue(true)

      await auth.enableBioAuth({ fallbackToDevicePin: true })

      expect(recordedEvents()).toEqual(['device_auth_unavailable', 'device_auth_restored'])

      canUseDeviceAuth.mockResolvedValue(false)
      await auth.refreshDeviceAuth()

      expect(recordedEvents()).toEqual([
        'device_auth_unavailable',
        'device_auth_restored',
        'device_auth_unavailable',
      ])
    })

    test.each(['disableBioAuth', 'clear', 'enableBioAuth'])(
      'closes the unavailable episode when %s removes device auth',
      async (operation) => {
        canUseDeviceAuth.mockResolvedValue(false)
        biometry.get.mockResolvedValue('Face ID')
        await auth.load()

        await auth[operation]()

        expect(await authAtom.get()).toMatchObject({
          deviceAuthEnabled: false,
          hasDeviceAuth: false,
          deviceAuthUnavailable: false,
          shouldAuthenticate: operation === 'enableBioAuth',
        })
        expect(recordedEvents()).toContain('device_auth_disabled')
        expect(recordedEvents()).not.toContain('device_auth_restored')

        authAtom = createInMemoryAtom()
        auth = createAuth()
        canUseDeviceAuth.mockResolvedValue(true)
        await auth.enableBioAuth({ fallbackToDevicePin: true })
        await auth.load()
        canUseDeviceAuth.mockResolvedValue(false)
        await auth.refreshDeviceAuth()

        const events = await eventLogAtom.get()
        const availabilityEvents = events
          .map(({ event }) => event)
          .filter((event) => event.startsWith('device_auth_'))
        expect(availabilityEvents).toEqual([
          'device_auth_unavailable',
          'device_auth_disabled',
          'device_auth_unavailable',
        ])
      }
    )

    test('does not probe the device when the flag is not set', async () => {
      await keystore.deleteSecret(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))

      await auth.refreshDeviceAuth()

      expect(canUseDeviceAuth).not.toHaveBeenCalled()
      expect(await authAtom.get()).toMatchObject({ hasDeviceAuth: false })
    })

    test('keeps device auth on and logs when probing the device fails', async () => {
      canUseDeviceAuth.mockRejectedValue(new Error('LAContext unavailable'))

      await expect(auth.refreshDeviceAuth()).resolves.toBeUndefined()

      expect(logger.warn).toHaveBeenCalledWith(
        'checking device auth availability failed',
        'LAContext unavailable'
      )
      expect(await authAtom.get()).toMatchObject({ hasDeviceAuth: true })
    })

    test('keeps requiring authentication and preserves unavailability when a later probe rejects', async () => {
      canUseDeviceAuth.mockResolvedValue(false)
      await auth.refreshDeviceAuth()
      canUseDeviceAuth.mockRejectedValue(new Error('LAContext unavailable'))

      await auth.refreshDeviceAuth()

      expect(await authAtom.get()).toMatchObject({
        hasDeviceAuth: true,
        deviceAuthUnavailable: true,
        shouldAuthenticate: true,
      })
      expect(eventLog.record).toHaveBeenCalledTimes(1)
    })

    test('logs and resolves when reading the flag fails', async () => {
      keystore.getSecret.mockRejectedValue(
        keychainError('Keystore is locked', 'E_KEYSTORE_ACCESS_ERROR')
      )

      await expect(auth.refreshDeviceAuth()).resolves.toBeUndefined()

      expect(logger.warn).toHaveBeenCalledWith(
        'refreshing device auth failed',
        'Keystore is locked'
      )
      expect(canUseDeviceAuth).not.toHaveBeenCalled()
      expect(await authAtom.get()).toMatchObject({ hasDeviceAuth: true })
    })
  })

  describe('removePin', () => {
    test('deletes PIN, updates atom, disables bio auth, and records event', async () => {
      await auth.setPin('123456')

      await auth.removePin()
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_PIN_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))
      expect(keystore.deleteSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY))
      expect(await authAtom.get()).toMatchObject({
        hasPin: false,
        hasBioAuth: false,
        hasDeviceAuth: false,
      })
      expect(eventLog.record).toHaveBeenCalledWith({ event: 'pin_auth_removed' })
    })
  })

  describe('setPin', () => {
    test('stores PIN, updates atom, and records event', async () => {
      await auth.setPin('123456')
      expect(keystore.setSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_PIN_KEY), '123456')
      expect(await authAtom.get()).toMatchObject({ hasPin: true })
      expect(eventLog.record).toHaveBeenCalledWith({ event: 'pin_auth_set' })
    })

    test('trims whitespace from PIN', async () => {
      await auth.setPin('  123456  ')
      expect(keystore.setSecret).toHaveBeenCalledWith(key(AUTH_KEYSTORE_PIN_KEY), '123456')
    })

    test('throws InvalidPasscodeLengthError for invalid PIN length', async () => {
      await expect(auth.setPin('12345')).rejects.toThrow(InvalidPasscodeLengthError)
      await expect(auth.setPin('1234567')).rejects.toThrow(InvalidPasscodeLengthError)
    })
  })
})
