import { canImplyAuthentication } from '@exodus/react-native-keychain'

const canUseDeviceAuth = {
  id: 'canUseDeviceAuth',
  type: 'module',
  factory: () => canImplyAuthentication,
  dependencies: [],
}

export default canUseDeviceAuth
