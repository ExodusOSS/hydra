import RNTouchId from '@exodus/react-native-touch-id'
import { pick } from '@exodus/basic-utils/src/lodash.js'

const getErrorProps = (err) => pick(err, ['name', 'code', 'message', 'stack'])

const promptConfig = {
  title: 'Fingerprint Scanner',
  imageColor: '#000000',
  imageErrorColor: '#000000',
  sensorDescription: 'Touch Sensor',
  sensorErrorDescription: 'Invalid',
  cancelText: 'Cancel',
  unifiedErrors: true,
}

class BioAuth {
  #logger

  constructor({ logger }) {
    this.#logger = logger
  }

  authenticate = async ({ prompt }) => {
    try {
      await RNTouchId.authenticate(prompt, promptConfig)
      return true
    } catch (err) {
      this.#logger.warn('bioauth failed', getErrorProps(err))
      return false
    }
  }

  stop = async () => {
    RNTouchId.stop()
  }
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
