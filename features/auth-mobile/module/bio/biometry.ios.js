import { AUTHENTICATION_TYPE, BIOMETRY_TYPE } from '@exodus/react-native-keychain'
import * as keychain from '@exodus/react-native-keychain'
import { FACE_ID, TOUCH_ID } from '../../constants'

const TYPES = {
  [BIOMETRY_TYPE.TOUCH_ID]: TOUCH_ID,
  [BIOMETRY_TYPE.FACE_ID]: FACE_ID,
}

// this is a separate class instead of a method on BioAuth, because
// we need to biometry inside the main auth module, which would create a cyclic dependency
// as the iOS BioAuth depends on the auth module

class Biometry {
  #appProcess
  constructor({ appProcess }) {
    this.#appProcess = appProcess
  }

  get = async () => {
    await this.#appProcess.awaitForeground()

    const bioAuthAvailable = await keychain.canImplyAuthentication({
      authenticationType: AUTHENTICATION_TYPE.BIOMETRICS,
    })

    if (!bioAuthAvailable) return

    const type = await keychain.getSupportedBiometryType()

    return TYPES[type]
  }
}

const createBiometry = (deps) => new Biometry(deps)

const biometryDefinition = {
  id: 'biometry',
  type: 'module',
  factory: createBiometry,
  dependencies: ['appProcess'],
  public: true,
}

export default biometryDefinition
