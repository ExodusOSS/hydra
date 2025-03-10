const createEnabledAssetsReport = ({ enabledAssetsAtom }) => ({
  namespace: 'enabledAssets',
  export: async ({ walletExists } = Object.create(null)) => {
    if (!walletExists) return null

    const data = await enabledAssetsAtom.get()
    return Object.keys(data)
      .filter((assetName) => data[assetName])
      .sort()
  },
})

const enabledAssetsReportDefinition = {
  id: 'enabledAssetsReport',
  type: 'report',
  factory: createEnabledAssetsReport,
  dependencies: ['enabledAssetsAtom'],
  public: true,
}

export default enabledAssetsReportDefinition
