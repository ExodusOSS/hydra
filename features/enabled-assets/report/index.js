const createEnabledAssetsReport = ({ enabledAssetsAtom }) => ({
  namespace: 'enabledAssets',
  export: async () => {
    const data = await enabledAssetsAtom.get()
    return {
      ...data,
    }
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
