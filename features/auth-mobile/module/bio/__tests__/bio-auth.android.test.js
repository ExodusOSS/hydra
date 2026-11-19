import { createInMemoryAtom } from '@exodus/atoms'

jest.mock('@exodus/react-native-biometrics', () => ({
  __esModule: true,
  default: {
    isSupported: jest.fn(),
    authenticate: jest.fn(),
    cancel: jest.fn(),
  },
}))

const { default: RNBiometrics } = await import('@exodus/react-native-biometrics')
const { default: bioAuthDefinition } = await import('../bio-auth.android.js')

describe('bio-auth (android)', () => {
  let bioAuth
  let authAtom
  let logger
  let auth

  beforeEach(() => {
    jest.clearAllMocks()
    authAtom = createInMemoryAtom({ defaultValue: { hasDeviceAuth: false } })
    logger = { warn: jest.fn() }
    auth = { refreshDeviceAuth: jest.fn(async () => {}) }
    bioAuth = bioAuthDefinition.factory({ authAtom, logger, auth })
  })

  describe('authenticate', () => {
    const promptArgs = {
      title: 'Unlock',
      subtitle: 'Use your fingerprint',
      cancelButtonText: 'Cancel',
    }

    test('forwards prompt args and the device-auth flag to the native module', async () => {
      await authAtom.set({ hasDeviceAuth: true })
      RNBiometrics.authenticate.mockResolvedValue(true)

      const result = await bioAuth.authenticate(promptArgs)

      expect(result).toBe(true)
      expect(RNBiometrics.authenticate).toHaveBeenCalledWith({
        ...promptArgs,
        fallbackToPasscode: true,
      })
      expect(auth.refreshDeviceAuth).not.toHaveBeenCalled()
    })

    test('returns false, logs, and refreshes device auth when the native call rejects', async () => {
      RNBiometrics.authenticate.mockRejectedValue(new Error('boom'))

      const result = await bioAuth.authenticate(promptArgs)

      expect(result).toBe(false)
      expect(logger.warn).toHaveBeenCalledWith(
        'bioauth failed',
        expect.objectContaining({ message: 'boom' })
      )
      expect(auth.refreshDeviceAuth).toHaveBeenCalledTimes(1)
    })

    test('returns false while the availability refresh is still pending', async () => {
      RNBiometrics.authenticate.mockRejectedValue(new Error('cancelled'))
      auth.refreshDeviceAuth.mockReturnValue(new Promise(() => {}))
      const onAuthenticated = jest.fn()

      void bioAuth.authenticate(promptArgs).then(onAuthenticated)
      await new Promise((resolve) => setImmediate(resolve))

      expect(auth.refreshDeviceAuth).toHaveBeenCalledTimes(1)
      expect(onAuthenticated).toHaveBeenCalledWith(false)
    })
  })

  describe('stop', () => {
    test('proactively cancels the in-flight BiometricPrompt', () => {
      bioAuth.stop()
      expect(RNBiometrics.cancel).toHaveBeenCalledTimes(1)
    })

    test('is a no-op when the native module does not expose cancel (older versions)', () => {
      const originalCancel = RNBiometrics.cancel
      delete RNBiometrics.cancel
      try {
        expect(() => bioAuth.stop()).not.toThrow()
      } finally {
        RNBiometrics.cancel = originalCancel
      }
    })

    test('swallows + logs errors thrown by the native cancel', () => {
      RNBiometrics.cancel.mockImplementationOnce(() => {
        throw new Error('native blew up')
      })

      expect(() => bioAuth.stop()).not.toThrow()
      expect(logger.warn).toHaveBeenCalledWith(
        'bioauth stop failed',
        expect.objectContaining({ message: 'native blew up' })
      )
    })
  })
})
