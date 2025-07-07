import { z } from '@exodus/zod'
import { memoize } from '@exodus/basic-utils'

const createRestoringAssetsReport = ({ restoringAssetsAtom }) => ({
  namespace: 'restoringAssets',
  export: async ({ walletExists, isLocked } = Object.create(null)) => {
    if (!walletExists || isLocked) return null

    const data = await restoringAssetsAtom.get()
    return { data: Object.keys(data).sort((a, b) => a.localeCompare(b)) }
  },
  getSchema: memoize(() =>
    z
      .object({
        data: z.array(z.string()),
      })
      .strict()
      .nullable()
  ),
})

const restoringAssetsReportDefinition = {
  id: 'restoringAssetsReport',
  type: 'report',
  factory: createRestoringAssetsReport,
  dependencies: ['restoringAssetsAtom'],
  public: true,
}

export default restoringAssetsReportDefinition
