import { BiometryChangedError } from '../utils/errors'

class BioAuth {
  #auth

  constructor({ auth }) {
    this.#auth = auth
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

      return false
    }
  }

  stop = () => {}
}

const createBioAuth = (deps) => new BioAuth(deps)

const bioAuthDefinition = {
  id: 'bioAuth',
  type: 'module',
  factory: createBioAuth,
  dependencies: ['auth'],
  public: true,
}

export default bioAuthDefinition
