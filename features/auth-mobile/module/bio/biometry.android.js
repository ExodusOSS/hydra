import RNTouchId from '@exodus/react-native-touch-id'

const TOUCH_ID = 'Fingerprint'

class Biometry {
  #logger

  constructor({ logger }) {
    this.#logger = logger
  }

  get = async () => {
    try {
      if (await RNTouchId.isSupported()) {
        return TOUCH_ID
      }
    } catch (err) {
      this.#logger.warn('biometrics not supported', err.message)
    }
  }
}

const createBiometry = (deps) => new Biometry(deps)

const biometryDefinition = {
  id: 'biometry',
  type: 'module',
  factory: createBiometry,
  dependencies: ['logger'],
  public: true,
}

export default biometryDefinition
