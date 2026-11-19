import { restrictConcurrency } from '@exodus/basic-utils'
// oxlint-disable-next-line no-restricted-imports -- isEqual and findLast are not available in @exodus/basic-utils.
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

const { isEqual, findLast } = lodash

const DEVICE_AUTH_CHECK_TIMEOUT = 5000

const flagKeyOpts = {
  accessible: ACCESSIBLE_WHEN_UNLOCKED_THIS_DEVICE_ONLY,
}

class Auth {
  #keystore
  #authAtom
  #logger
  #eventLog
  #eventLogAtom
  #keyPrefix
  #biometry
  #canUseDeviceAuth

  constructor({
    keystore,
    authAtom,
    logger,
    eventLog,
    eventLogAtom,
    biometry,
    canUseDeviceAuth,
    config,
  }) {
    const { keyPrefix } = { ...defaultConfig, ...config }
    this.#keystore = keystore
    this.#authAtom = authAtom
    this.#logger = logger
    this.#eventLog = eventLog
    this.#eventLogAtom = eventLogAtom
    this.#keyPrefix = keyPrefix
    this.#biometry = biometry
    this.#canUseDeviceAuth = canUseDeviceAuth
  }

  #key = (key) => `${this.#keyPrefix}${key}`

  canUseDeviceAuth = async ({
    authenticationType = AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
  } = {}) => {
    let timer
    try {
      return await Promise.race([
        this.#canUseDeviceAuth({ authenticationType }),
        new Promise((_resolve, reject) => {
          timer = setTimeout(
            () => reject(new Error('Device auth availability check timed out')),
            DEVICE_AUTH_CHECK_TIMEOUT
          )
        }),
      ])
    } finally {
      clearTimeout(timer)
    }
  }

  hasPin = () => this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_PIN_KEY)).then(Boolean)

  #hasBioAuth = () => this.#hasFlag(AUTH_KEYSTORE_BIO_AUTH_KEY)

  #hasDeviceAuth = () => this.#hasFlag(AUTH_KEYSTORE_DEVICE_AUTH_KEY)

  // A flag only ever stores `true`, so an entry that exists but cannot be decrypted still means "on"
  #hasFlag = async (flagKey) => {
    const key = this.#key(flagKey)
    try {
      return Boolean(await this.#keystore.getSecret(key))
    } catch (error) {
      if (!isUndecryptableEntryError(error)) throw error

      this.#logger.warn(`rewriting undecryptable ${flagKey} entry`, error.message)
      // The failed read generated a fresh Keystore key for this alias, so the rewrite decrypts from now on
      await this.#keystore
        .setSecret(key, true, flagKeyOpts)
        .catch((rewriteError) =>
          this.#logger.error(`rewriting ${flagKey} failed`, rewriteError.message)
        )
      return true
    }
  }

  #setBioAuth = async (on, { useDeviceAuth } = {}) => {
    if (!on) {
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY))
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_KEY))
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
      return
    }

    if (useDeviceAuth) {
      // Android and iOS handle `ACCESS_CONTROL_USER_PRESENCE` differently when device auth
      // is not enabled. This check ensures consistent behavior across platforms.
      const canAuth = await this.canUseDeviceAuth()
      if (!canAuth) {
        throw new DeviceAuthenticationUnavailableError()
      }

      await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY), on, {
        ...flagKeyOpts,
        accessControl: ACCESS_CONTROL_USER_PRESENCE, // This flag allows iOS to fallback to device pin.
      })
      await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_DEVICE_AUTH_KEY), on, flagKeyOpts)
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_KEY))
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
    } else {
      await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY), on, {
        ...flagKeyOpts,
        accessControl: ACCESS_CONTROL_BIOMETRY_CURRENT_SET,
      })
      await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_KEY), on, flagKeyOpts)
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_DEVICE_AUTH_KEY))
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY))
    }
  }

  load = () => this.#enqueue(this.#load)

  #load = async () => {
    const hasPin = await this.hasPin()
    const hasBioAuth = await this.#hasBioAuth()
    const hasDeviceAuthFlag = await this.#hasDeviceAuth()
    const biometry = await this.#biometry.get()

    await this.#syncDeviceAuth(hasDeviceAuthFlag, { hasPin, biometry, hasBioAuth })
  }

  // Reached from a failed OS prompt, so it must never reject
  refreshDeviceAuth = () => this.#enqueue(this.#refreshDeviceAuth)

  #refreshDeviceAuth = async () => {
    try {
      // Reload every credential so a failed initial load cannot be followed by a partial first write.
      await this.#load()
    } catch (error) {
      this.#logger.warn('refreshing device auth failed', error?.message)
    }
  }

  // A false probe can be a native error; availability must never disable configured authentication.
  #syncDeviceAuth = async (hasDeviceAuthFlag, otherAuthState = {}) => {
    const canAuth = hasDeviceAuthFlag ? await this.#probeDeviceAuth() : false
    await this.#mergeIntoAtom((current) => ({
      ...otherAuthState,
      deviceAuthEnabled: hasDeviceAuthFlag,
      hasDeviceAuth: hasDeviceAuthFlag,
      deviceAuthUnavailable:
        hasDeviceAuthFlag &&
        (canAuth === undefined ? (current?.deviceAuthUnavailable ?? false) : !canAuth),
    }))

    if (hasDeviceAuthFlag && canAuth !== undefined) {
      await this.#recordDeviceAuthAvailability(
        canAuth ? 'device_auth_restored' : 'device_auth_unavailable'
      )
    }
  }

  // Dedupes against the persisted log rather than the in-memory atom so a drop is recorded once, not on every cold start
  #recordDeviceAuthAvailability = async (event) => {
    try {
      const events = await this.#eventLogAtom.get()
      const lastEvent = findLast(
        events,
        ({ event }) =>
          event === 'device_auth_unavailable' ||
          event === 'device_auth_restored' ||
          event === 'device_auth_disabled'
      )
      const wasUnavailable = lastEvent?.event === 'device_auth_unavailable'
      const isUnavailable = event === 'device_auth_unavailable'

      if (isUnavailable !== wasUnavailable) {
        await this.#eventLog.record({ event })
      }
    } catch (error) {
      this.#logger.warn('recording device auth availability failed', error?.message)
    }
  }

  // A rejected probe leaves availability unknown, so callers keep the last known availability.
  #probeDeviceAuth = async () => {
    try {
      return await this.canUseDeviceAuth()
    } catch (error) {
      this.#logger.warn('checking device auth availability failed', error?.message)
    }
  }

  // The current value cannot be read up front because `get()` blocks until the atom is first set
  #mergeIntoAtom = async (patch) => {
    await this.#authAtom.set((current) => {
      const data = {
        ...current,
        ...(typeof patch === 'function' ? patch(current) : patch),
      }

      const { hasBioAuth, biometry, hasPin, hasDeviceAuth } = data

      data.hasBioAuth = hasBioAuth && !!biometry
      data.hasDeviceAuth = hasDeviceAuth && !data.hasBioAuth
      data.shouldAuthenticate = hasDeviceAuth || hasBioAuth || hasPin

      if (isEqual(current, data)) return current

      this.#logger.info('Updated auth data', data)
      return data
    })
  }

  setPin = (value) =>
    this.#enqueue(async () => {
      value = value.trim()

      if (value.length !== 6) {
        throw new InvalidPasscodeLengthError()
      }

      await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_PIN_KEY), value)
      await this.#mergeIntoAtom({ hasPin: true })

      await this.#eventLog.record({ event: 'pin_auth_set' })
    })

  isCorrectPin = async (input) => {
    const pin = await this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_PIN_KEY))
    return !!pin && pin === input
  }

  enableBioAuth = (options) => this.#enqueue(() => this.#enableBioAuth(options))

  #enableBioAuth = async ({ fallbackToDevicePin = false } = {}) => {
    await this.#setBioAuth(true, { useDeviceAuth: fallbackToDevicePin })
    await this.#mergeIntoAtom({
      deviceAuthUnavailable: false,
      ...(fallbackToDevicePin
        ? { deviceAuthEnabled: true, hasDeviceAuth: true, hasBioAuth: false }
        : { deviceAuthEnabled: false, hasDeviceAuth: false, hasBioAuth: true }),
    })
    await this.#recordDeviceAuthAvailability(
      fallbackToDevicePin ? 'device_auth_restored' : 'device_auth_disabled'
    )
  }

  removePin = () => this.#enqueue(this.#removePin)

  disableBioAuth = () => this.#enqueue(this.#disableBioAuth)

  #disableBioAuth = async () => {
    await this.#setBioAuth(false)
    await this.#mergeIntoAtom({
      deviceAuthEnabled: false,
      hasDeviceAuth: false,
      hasBioAuth: false,
      deviceAuthUnavailable: false,
    })
    await this.#recordDeviceAuthAvailability('device_auth_disabled')
  }

  getBioAuthTrigger = async () => {
    const isAuthenticated = await this.#keystore.getSecret(
      this.#key(AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY)
    )
    if (isAuthenticated) return isAuthenticated

    return this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
  }

  clear = () => this.#enqueue(this.#clear)

  #clear = async () => {
    await this.#removePin()

    await this.#eventLog.record({ event: 'all_auth_removed' })
  }

  #removePin = async () => {
    await this.#disableBioAuth()
    await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_PIN_KEY))
    await this.#mergeIntoAtom({ hasPin: false })

    await this.#eventLog.record({ event: 'pin_auth_removed' })
  }

  // Every auth mutation shares one lock, so the private un-enqueued forms are what nested calls use
  #enqueue = restrictConcurrency((operation) => operation())
}

// Android rejects with this code when an entry exists but its Keystore key can no longer decrypt it
const KEYCHAIN_CRYPTO_FAILED_CODE = 'E_CRYPTO_FAILED'

const isUndecryptableEntryError = (error) => error?.code === KEYCHAIN_CRYPTO_FAILED_CODE

const createAuthModule = (deps) => new Auth(deps)

const authDefinition = {
  id: 'auth',
  type: 'module',
  factory: createAuthModule,
  dependencies: [
    'authAtom',
    'logger',
    'eventLog',
    'eventLogAtom',
    'keystore',
    'biometry',
    'config?',
    'canUseDeviceAuth',
  ],
  public: true,
}

export default authDefinition
