import { createInMemoryAtom } from '@exodus/atoms'

import authReportDefinition from '../index.js'

describe('authReport', () => {
  let authAtom

  beforeEach(() => {
    authAtom = createInMemoryAtom()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should provide the correct namespace', async () => {
    const report = authReportDefinition.factory({
      authAtom,
    })

    expect(report.namespace).toEqual('auth')
  })

  it.each([
    {
      deviceAuthEnabled: false,
      hasDeviceAuth: false,
      deviceAuthUnavailable: false,
      deviceAuthStatus: 'disabled',
    },
    {
      deviceAuthEnabled: true,
      hasDeviceAuth: true,
      deviceAuthUnavailable: false,
      deviceAuthStatus: 'available',
    },
    {
      deviceAuthEnabled: true,
      hasDeviceAuth: true,
      deviceAuthUnavailable: true,
      deviceAuthStatus: 'unavailable',
    },
  ])(
    'should report device auth as $deviceAuthStatus',
    async ({ deviceAuthStatus, ...deviceAuth }) => {
      const report = authReportDefinition.factory({
        authAtom,
      })

      const newAuth = {
        hasPin: false,
        hasBioAuth: false,
        biometry: 'Touch ID',
      }
      await authAtom.set({ ...newAuth, ...deviceAuth })

      expect(report.getSchema().parse(await report.export({ walletExists: false }))).toEqual(null)
      expect(report.getSchema().parse(await report.export({ walletExists: true }))).toEqual({
        ...newAuth,
        hasDeviceAuth: deviceAuth.hasDeviceAuth,
        deviceAuthStatus,
      })
    }
  )

  it('reports available device auth when biometric auth takes precedence', async () => {
    const report = authReportDefinition.factory({ authAtom })
    await authAtom.set({
      deviceAuthEnabled: true,
      hasDeviceAuth: false,
      deviceAuthUnavailable: false,
      hasBioAuth: true,
      biometry: 'Face ID',
    })

    expect(report.getSchema().parse(await report.export({ walletExists: true }))).toMatchObject({
      hasBioAuth: true,
      hasDeviceAuth: false,
      deviceAuthStatus: 'available',
    })
  })

  it('should reject an invalid device auth status', () => {
    const report = authReportDefinition.factory({ authAtom })

    expect(report.getSchema().safeParse({ deviceAuthStatus: 'invalid' }).success).toBe(false)
  })
})
