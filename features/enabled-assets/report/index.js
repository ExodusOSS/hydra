import { memoize } from '@exodus/basic-utils'
import { z } from '@exodus/zod'

const createEnabledAssetsReport = ({ enabledAssetsAtom }) => ({
  namespace: 'enabledAssets',
  export: async ({ walletExists, isLocked } = Object.create(null)) => {
    if (!walletExists || isLocked) return null

    const data = await enabledAssetsAtom.get()
    return Object.keys(data)
      .filter((assetName) => data[assetName])
      .sort()
  },
  getSchema: memoize(() => z.array(z.string()).nullable()),
})

const enabledAssetsReportDefinition = {
  id: 'enabledAssetsReport',
  type: 'report',
  factory: createEnabledAssetsReport,
  dependencies: ['enabledAssetsAtom'],
  public: true,
}

export default enabledAssetsReportDefinition
