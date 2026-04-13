export const AUTH_KEYSTORE_PIN_KEY = 'pin'

export const AUTH_KEYSTORE_BIO_AUTH_KEY = 'bioAuth'
export const AUTH_KEYSTORE_DEVICE_AUTH_KEY = 'deviceAuth'

export const AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY = 'bioAuthTrigger'
// Allows fallback to device passcode.
export const AUTH_KEYSTORE_DEVICE_AUTH_TRIGGER_KEY = 'deviceAuthTrigger'

export const FACE_ID = 'Face ID'

export const defaultConfig = {
  keyPrefix: 'auth:',
}

// from @exodus/react-native-keychain
export const ACCESS_CONTROL_BIOMETRY_CURRENT_SET = 'BiometryCurrentSet'
export const ACCESSIBLE_WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'AccessibleWhenUnlockedThisDeviceOnly'
export const ACCESS_CONTROL_USER_PRESENCE = 'UserPresence'
export const AUTHENTICATION_TYPE = {
  DEVICE_PASSCODE_OR_BIOMETRICS: 'AuthenticationWithBiometricsDevicePasscode',
}
