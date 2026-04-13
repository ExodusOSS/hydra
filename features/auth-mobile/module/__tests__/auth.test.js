import { createInMemoryAtom } from '@exodus/atoms'

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

describe('Auth module', () => {
  let auth
  let keystore
  let authAtom
  let logger
  let eventLog
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

    eventLog = {
      record: jest.fn(async () => {}),
    }

    biometry = {
      get: jest.fn(async () => null),
    }

    canUseDeviceAuth = jest.fn(async () => true)

    auth = authDefinition.factory({
      keystore,
      authAtom,
      logger,
      eventLog,
      biometry,
      canUseDeviceAuth,
    })
  })

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
    })

    test('throws DeviceAuthenticationUnavailableError when device auth unavailable', async () => {
      canUseDeviceAuth.mockResolvedValue(false)

      await expect(auth.enableBioAuth({ fallbackToDevicePin: true })).rejects.toThrow(
        DeviceAuthenticationUnavailableError
      )
      expect(keystore.setSecret).not.toHaveBeenCalled()
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
      })
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
