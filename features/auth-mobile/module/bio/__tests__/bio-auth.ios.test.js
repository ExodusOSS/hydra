import { createInMemoryAtom } from '@exodus/atoms'
import createErrorTracking from '@exodus/error-tracking'

import { BiometryChangedError, DeviceAuthenticationFailedError } from '../../utils/errors.js'
import bioAuthDefinition from '../bio-auth.ios.js'

const trackingDefinitions = createErrorTracking().definitions
const trackingDefinition = trackingDefinitions.find(
  ({ definition }) => definition.id === 'errorTracking'
)
const reportDefinition = trackingDefinitions.find(
  ({ definition }) => definition.id === 'errorTrackingReport'
).definition

describe('bio-auth (ios)', () => {
  let bioAuth
  let auth
  let authEnabled
  let errorTracking
  let report

  beforeEach(() => {
    const errorsAtom = createInMemoryAtom({ defaultValue: { errors: [] } })
    errorTracking = trackingDefinition.definition.factory({
      errorsAtom,
      config: trackingDefinition.config,
      logger: { error: jest.fn() },
    })
    report = reportDefinition.factory({ errorsAtom })
    authEnabled = true
    auth = {
      getBioAuthTrigger: jest.fn(async () => true),
      disableBioAuth: async () => {
        authEnabled = false
      },
      refreshDeviceAuth: jest.fn(async () => {}),
    }
    bioAuth = bioAuthDefinition.factory({ auth, errorTracking })
  })

  describe('authenticate', () => {
    test('returns true when the trigger is readable', async () => {
      await expect(bioAuth.authenticate()).resolves.toBe(true)
      expect(auth.refreshDeviceAuth).not.toHaveBeenCalled()
    })

    test('disables bio auth and throws BiometryChanged when the trigger is missing', async () => {
      auth.getBioAuthTrigger.mockImplementation(async () => {})

      await expect(bioAuth.authenticate()).rejects.toBeInstanceOf(BiometryChangedError)
      expect(authEnabled).toBe(false)
      expect(auth.refreshDeviceAuth).not.toHaveBeenCalled()
    })

    test.each(['-128', -128])('keeps cancellation (%s) quiet', async (code) => {
      auth.getBioAuthTrigger.mockRejectedValue(Object.assign(new Error('User canceled'), { code }))

      await expect(bioAuth.authenticate()).resolves.toBe(false)
      expect(await report.export()).toEqual({ errors: [] })
      expect(authEnabled).toBe(true)
      expect(auth.refreshDeviceAuth).toHaveBeenCalledTimes(1)
    })

    test.each([
      ['-25293', 'authentication rejected (-25293)'],
      [-25_308, 'interaction not allowed (-25308)'],
    ])('reports native failure %s without exposing the native payload', async (code, reason) => {
      const nativeError = Object.assign(new Error('private native error message'), {
        code,
        account: 'private account',
      })
      auth.getBioAuthTrigger.mockRejectedValue(nativeError)

      const error = await bioAuth.authenticate().catch((error) => error)
      expect(error).toBeInstanceOf(DeviceAuthenticationFailedError)
      expect(error.message).toBe(`iOS device authentication failed: ${reason}`)
      expect(authEnabled).toBe(true)

      const result = report.getSchema().parse(await report.export())
      const serialized = JSON.parse(JSON.stringify(result))
      expect(serialized.errors).toEqual([
        expect.objectContaining({
          namespace: 'auth-mobile',
          error: expect.objectContaining({
            name: 'DeviceAuthenticationFailed',
            hint: error.message,
          }),
        }),
      ])
      expect(JSON.stringify(serialized)).not.toContain(nativeError.message)
      expect(JSON.stringify(serialized)).not.toContain(nativeError.account)
      expect(error.cause).toBeUndefined()

      auth.getBioAuthTrigger.mockResolvedValue(true)
      await expect(bioAuth.authenticate()).resolves.toBe(true)
    })

    test('redacts unknown error codes and messages before tracking', async () => {
      auth.getBioAuthTrigger.mockRejectedValue(
        Object.assign(new Error('private native message'), { code: 'private unknown code' })
      )
      const error = await bioAuth.authenticate().catch((error) => error)

      expect(error).toBeInstanceOf(DeviceAuthenticationFailedError)
      expect(error.message).toBe('iOS device authentication failed: unknown error')
      const serialized = JSON.stringify(await report.export())
      expect(serialized).toContain('iOS device authentication failed: unknown error')
      expect(serialized).not.toContain('private native message')
      expect(serialized).not.toContain('private unknown code')
    })

    test('preserves the authentication failure when reporting rejects', async () => {
      auth.getBioAuthTrigger.mockRejectedValue({ code: '-25308' })
      errorTracking.track = async () => {
        throw new Error('Reporting unavailable')
      }

      await expect(bioAuth.authenticate()).rejects.toBeInstanceOf(DeviceAuthenticationFailedError)
    })

    test('does not wait for reporting before rejecting the authentication', async () => {
      auth.getBioAuthTrigger.mockRejectedValue({ code: '-25308' })
      errorTracking.track = () => new Promise(() => {})

      await expect(bioAuth.authenticate()).rejects.toBeInstanceOf(DeviceAuthenticationFailedError)
    })

    test('refreshes device auth when the read fails', async () => {
      auth.getBioAuthTrigger.mockRejectedValue({ code: '-25308' })

      await expect(bioAuth.authenticate()).rejects.toBeInstanceOf(DeviceAuthenticationFailedError)
      expect(auth.refreshDeviceAuth).toHaveBeenCalledTimes(1)
    })

    test('returns false while the availability refresh is still pending', async () => {
      auth.getBioAuthTrigger.mockRejectedValue(
        Object.assign(new Error('User canceled'), { code: '-128' })
      )
      auth.refreshDeviceAuth.mockReturnValue(new Promise(() => {}))
      const onAuthenticated = jest.fn()

      void bioAuth.authenticate().then(onAuthenticated)
      await new Promise((resolve) => setImmediate(resolve))

      expect(auth.refreshDeviceAuth).toHaveBeenCalledTimes(1)
      expect(onAuthenticated).toHaveBeenCalledWith(false)
    })
  })
})
