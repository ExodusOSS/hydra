import RNBiometrics from '@exodus/react-native-biometrics'
import { pick } from '@exodus/basic-utils'

const getErrorProps = (err) => pick(err, ['name', 'code', 'message', 'stack'])

class BioAuth {
  #logger

  constructor({ logger }) {
    this.#logger = logger
  }

  authenticate = async ({ title, subtitle, cancelButtonText }) => {
    try {
      await RNBiometrics.authenticate({ title, subtitle, cancelButtonText })
      return true
    } catch (err) {
      this.#logger.warn('bioauth failed', getErrorProps(err))
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
  dependencies: ['logger'],
  public: true,
}

export default bioAuthDefinition
