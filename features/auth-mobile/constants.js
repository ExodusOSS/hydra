import { Platform } from 'react-native'

export const AUTH_KEYSTORE_PIN_KEY = 'pin'

export const AUTH_KEYSTORE_BIO_AUTH_KEY = 'bioAuth'

export const AUTH_KEYSTORE_BIO_AUTH_TRIGGER_KEY = 'bioAuthTrigger'

export const FACE_ID = 'Face ID'

export const TOUCH_ID = Platform.OS === 'android' ? 'Fingerprint' : 'Touch ID'
