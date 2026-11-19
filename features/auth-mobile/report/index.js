import { z } from '@exodus/zod'
import { memoize } from '@exodus/basic-utils'

const createAuthReport = ({ authAtom }) => ({
  namespace: 'auth',
  export: async ({ walletExists } = Object.create(null)) => {
    if (!walletExists) return null

    const auth = await authAtom.get()

    if (!auth) return null

    let deviceAuthStatus = 'disabled'
    if (auth.deviceAuthEnabled) {
      deviceAuthStatus = auth.deviceAuthUnavailable ? 'unavailable' : 'available'
    }

    return {
      biometry: auth.biometry,
      hasPin: auth.hasPin,
      hasBioAuth: auth.hasBioAuth,
      hasDeviceAuth: auth.hasDeviceAuth,
      deviceAuthStatus,
    }
  },
  getSchema: memoize(() =>
    z
      .object({
        biometry: z.string().nullish(),
        hasPin: z.boolean().nullish(),
        hasBioAuth: z.boolean().nullish(),
        hasDeviceAuth: z.boolean().nullish(),
        deviceAuthStatus: z.enum(['disabled', 'available', 'unavailable']),
      })
      .nullable()
  ),
})

const authReportDefinition = {
  id: 'authReport',
  type: 'report',
  factory: createAuthReport,
  dependencies: ['authAtom'],
  public: true,
}

export default authReportDefinition
