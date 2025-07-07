import { z } from '@exodus/zod'
import { memoize } from '@exodus/basic-utils'

const createAnalyticsReport = ({ analyticsUserIdAtom }) => ({
  namespace: 'analytics',
  export: async ({ walletExists, isLocked } = Object.create(null)) => ({
    userId: walletExists && !isLocked ? await analyticsUserIdAtom.get() : null,
  }),
  getSchema: memoize(() =>
    z
      .object({
        userId: z.string().nullable(),
      })
      .strict()
  ),
})

const analyticsReportDefinition = {
  id: 'analyticsReport',
  type: 'report',
  factory: createAnalyticsReport,
  dependencies: ['analyticsUserIdAtom'],
  public: true,
}

export default analyticsReportDefinition
