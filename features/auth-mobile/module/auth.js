// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import {
  AUTH_KEYSTORE_BIO_AUTH_KEY,
  AUTH_KEYSTORE_DEVICE_AUTH_KEY,
  AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY,
  AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY,
  AUTH_KEYSTORE_PIN_KEY,
  ACCESS_CONTROL_BIOMETRY_CURRENT_SET,
  ACCESSIBLE_WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  AUTHENTICATION_TYPE,
  ACCESS_CONTROL_USER_PRESENCE,
  defaultConfig,
} from '../constants.js'
import { DeviceAuthenticationUnavailableError, InvalidPasscodeLengthError } from './utils/errors.js'

const { isEqual } = lodash

class Auth {
  #keystore
  #authAtom
  #logger
  #eventLog
  #keyPrefix
  #biometry
  #canUseDeviceAuth

  constructor({ keystore, authAtom, logger, eventLog, biometry, canUseDeviceAuth, config }) {
    const { keyPrefix } = { ...defaultConfig, ...config }
    this.#keystore = keystore
    this.#authAtom = authAtom
    this.#logger = logger
    this.#eventLog = eventLog
    this.#keyPrefix = keyPrefix
    this.#biometry = biometry
    this.#canUseDeviceAuth = canUseDeviceAuth
  }

  #key = (key) => `${this.#keyPrefix}${key}`

  canUseDeviceAuth = ({
    authenticationType = AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
  } = {}) => this.#canUseDeviceAuth({ authenticationType })

  hasPin = () => this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_PIN_KEY)).then(Boolean)

  #hasBioAuth = () => this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_KEY)).then(Boolean)

  #hasDeviceAuth = () =>
    this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_DEVICE_AUTH_KEY)).then(Boolean)

  #setBioAuth = async (on, { useDeviceAuth } = {}) => {
    if (!on) {
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY))
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_KEY))
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
      return
    }

    const keyOpts = {
      accessible: ACCESSIBLE_WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }

    if (useDeviceAuth) {
      // Android and iOS handle `ACCESS_CONTROL_USER_PRESENCE` differently when device auth
      // is not enabled. This check ensures consistent behavior across platforms.
      const canAuth = await this.canUseDeviceAuth()
      if (!canAuth) {
        throw new DeviceAuthenticationUnavailableError()
      }

      await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), on, keyOpts)
      await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY), on, {
        ...keyOpts,
        accessControl: ACCESS_CONTROL_USER_PRESENCE, // This flag allows iOS to fallback to device pin.
      })
    } else {
      await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_KEY), on, keyOpts)
      await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY), on, {
        ...keyOpts,
        accessControl: ACCESS_CONTROL_BIOMETRY_CURRENT_SET,
      })
    }
  }

  load = async () => {
    const hasPin = await this.hasPin()
    const hasBioAuth = await this.#hasBioAuth()
    const hasDeviceAuth = await this.#hasDeviceAuth()
    const biometry = await this.#biometry.get()

    await this.#mergeIntoAtom({ hasPin, biometry, hasBioAuth, hasDeviceAuth })
  }

  #mergeIntoAtom = async (params) => {
    await this.#authAtom.set((current) => {
      const data = {
        ...current,
        ...params,
      }

      const { hasBioAuth, biometry, hasPin, hasDeviceAuth } = data

      data.hasBioAuth = hasBioAuth && !!biometry
      data.shouldAuthenticate = hasDeviceAuth || hasBioAuth || hasPin

      if (isEqual(current, data)) return current

      this.#logger.info('Updated auth data', data)
      return data
    })
  }

  setPin = async (value) => {
    value = value.trim()

    if (value.length !== 6) {
      throw new InvalidPasscodeLengthError()
    }

    await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_PIN_KEY), value)
    await this.#mergeIntoAtom({ hasPin: true })

    await this.#eventLog.record({ event: 'pin_auth_set' })
  }

  isCorrectPin = async (input) => {
    const pin = await this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_PIN_KEY))
    return !!pin && pin === input
  }

  enableBioAuth = async ({ fallbackToDevicePin = false } = {}) => {
    await this.#setBioAuth(true, { useDeviceAuth: fallbackToDevicePin })
    await this.#mergeIntoAtom(fallbackToDevicePin ? { hasDeviceAuth: true } : { hasBioAuth: true })
  }

  removePin = async () => {
    await this.disableBioAuth()
    await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_PIN_KEY))
    await this.#mergeIntoAtom({ hasPin: false })

    await this.#eventLog.record({ event: 'pin_auth_removed' })
  }

  disableBioAuth = async () => {
    await this.#setBioAuth(false)
    await this.#mergeIntoAtom({ hasDeviceAuth: false, hasBioAuth: false })
  }

  getBioAuthTrigger = async () => {
    const isAuthenticated = await this.#keystore.getSecret(
      this.#key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY)
    )
    if (isAuthenticated) return isAuthenticated

    return this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
  }

  clear = async () => {
    await this.removePin()

    await this.#eventLog.record({ event: 'all_auth_removed' })
  }
}

const createAuthModule = (deps) => new Auth(deps)

const authDefinition = {
  id: 'auth',
  type: 'module',
  factory: createAuthModule,
  dependencies: [
    'authAtom',
    'logger',
    'eventLog',
    'keystore',
    'biometry',
    'config?',
    'canUseDeviceAuth',
  ],
  public: true,
}

export default authDefinition
