import RNBiometrics from '@exodus/react-native-biometrics'
import { pick } from '@exodus/basic-utils'

const getErrorProps = (err) => pick(err, ['name', 'code', 'message', 'stack'])

class BioAuth {
  #logger
  #authAtom
  #auth

  constructor({ authAtom, logger, auth }) {
    this.#logger = logger
    this.#authAtom = authAtom
    this.#auth = auth
  }

  authenticate = async ({ title, subtitle, cancelButtonText }) => {
    const { hasDeviceAuth } = await this.#authAtom.get()
    try {
      // explicitly awaits the promise to catch errors
      return await RNBiometrics.authenticate({
        title,
        subtitle,
        cancelButtonText,
        fallbackToPasscode: hasDeviceAuth,
      })
    } catch (err) {
      this.#logger.warn('bioauth failed', getErrorProps(err))
      void this.#auth.refreshDeviceAuth()
      return false
    }
  }

  stop = () => {
    try {
      RNBiometrics.cancel?.()
    } catch (err) {
      this.#logger.warn('bioauth stop failed', getErrorProps(err))
    }
  }
}

const createBioAuth = (deps) => new BioAuth(deps)

const bioAuthDefinition = {
  id: 'bioAuth',
  type: 'module',
  factory: createBioAuth,
  dependencies: ['logger', 'authAtom', 'auth'],
  public: true,
}

export default bioAuthDefinition
