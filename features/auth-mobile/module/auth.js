import { isEqual } from 'lodash'
import { ACCESS_CONTROL, ACCESSIBLE } from '@exodus/react-native-keychain'
import {
  AUTH_KEYSTORE_BIO_AUTH_KEY,
  AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY,
  AUTH_KEYSTORE_PIN_KEY,
} from '../constants'
import { InvalidPasscodeLengthError } from './utils/errors'

export const MODULE_ID = 'auth'

class Auth {
  #keystore
  #authAtom
  #logger
  #keyPrefix
  #biometry

  constructor({
    keystore,
    authAtom,
    logger,
    biometry,
    config: { keyPrefix = `${MODULE_ID}:` } = {},
  }) {
    this.#keystore = keystore
    this.#authAtom = authAtom
    this.#logger = logger
    this.#keyPrefix = keyPrefix
    this.#biometry = biometry
  }

  #key = (key) => `${this.#keyPrefix}${key}`

  hasPin = () => this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_PIN_KEY)).then(Boolean)

  #hasBioAuth = () => this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_KEY)).then(Boolean)

  #setBioAuth = async (on) => {
    if (!on) {
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_KEY))
      await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
      return
    }

    const keyOpts = {
      accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }

    const triggerOpts = {
      ...keyOpts,
      accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    }

    await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_KEY), on, keyOpts)
    await this.#keystore.setSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY), on, triggerOpts)
  }

  load = async () => {
    const hasPin = await this.hasPin()
    const hasBioAuth = await this.#hasBioAuth()
    const biometry = await this.#biometry.get()

    await this.#mergeIntoAtom({ hasPin, biometry, hasBioAuth })
  }

  #mergeIntoAtom = async (params) => {
    await this.#authAtom.set((current) => {
      const data = {
        ...current,
        ...params,
      }

      const { hasBioAuth, biometry, hasPin } = data

      data.hasBioAuth = hasBioAuth && !!biometry
      data.shouldAuthenticate = hasBioAuth || hasPin

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
  }

  isCorrectPin = async (input) => {
    const pin = await this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_PIN_KEY))
    return !!pin && pin === input
  }

  enableBioAuth = async () => {
    await this.#setBioAuth(true)
    await this.#mergeIntoAtom({ hasBioAuth: true })
  }

  removePin = async () => {
    await this.disableBioAuth()
    await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_PIN_KEY))
    await this.#mergeIntoAtom({ hasPin: false })
  }

  disableBioAuth = async () => {
    await this.#setBioAuth(false)
    await this.#mergeIntoAtom({ hasBioAuth: false })
  }

  removeBioAuthTrigger = async () => {
    await this.#keystore.deleteSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
  }

  getBioAuthTrigger = async () => {
    return this.#keystore.getSecret(this.#key(AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY))
  }

  clear = async () => {
    await Promise.all([this.removePin(), this.disableBioAuth(), this.removeBioAuthTrigger()])
  }
}

const createAuthModule = (deps) => new Auth(deps)

const authDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createAuthModule,
  dependencies: ['authAtom', 'logger', 'keystore', 'biometry', 'config?'],
  public: true,
}

export default authDefinition
