import { safeString } from '@exodus/safe-string'
import { BiometryChangedError, DeviceAuthenticationFailedError } from '../utils/errors.js'

class BioAuth {
  #auth
  #errorTracking

  constructor({ auth, errorTracking }) {
    this.#auth = auth
    this.#errorTracking = errorTracking
  }

  authenticate = async () => {
    try {
      // loading the bioAuthTrigger will trigger the keychain security
      // if the user approves, it will succeed, if not it will throw
      const value = await this.#auth.getBioAuthTrigger()

      if (value === undefined) {
        await this.#auth.disableBioAuth()
        throw new BiometryChangedError()
      }

      return true
    } catch (e) {
      if (e instanceof BiometryChangedError) throw e

      void this.#auth.refreshDeviceAuth()
      if (String(e?.code) === '-128') return false

      const error = new DeviceAuthenticationFailedError(e?.code)
      void this.#errorTracking.track({ namespace: safeString`auth-mobile`, error }).catch(() => {})
      throw error
    }
  }

  stop = () => {}
}

const createBioAuth = (deps) => new BioAuth(deps)

const bioAuthDefinition = {
  id: 'bioAuth',
  type: 'module',
  factory: createBioAuth,
  dependencies: ['auth', 'errorTracking'],
  public: true,
}

export default bioAuthDefinition
