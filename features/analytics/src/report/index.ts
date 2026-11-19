import { z } from '@exodus/zod'
import { memoize } from '@exodus/basic-utils'
import type { Atom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

type Params = {
  analyticsUserIdAtom: Pick<Atom<string>, 'get'>
}

type ExportArgs = {
  walletExists?: boolean
  isLocked?: boolean
}

const createAnalyticsReport = ({ analyticsUserIdAtom }: Params) => ({
  namespace: 'analytics',
  export: async ({ walletExists, isLocked }: ExportArgs = Object.create(null)) => ({
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
} as const satisfies Definition

export default analyticsReportDefinition
