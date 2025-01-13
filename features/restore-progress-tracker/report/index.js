const createRestoringAssetsReport = ({ restoringAssetsAtom }) => ({
  namespace: 'restoringAssets',
  export: async () => {
    const data = await restoringAssetsAtom.get()
    return { data: Object.keys(data).sort((a, b) => a.localeCompare(b)) }
  },
})

const restoringAssetsReportDefinition = {
  id: 'restoringAssetsReport',
  type: 'report',
  factory: createRestoringAssetsReport,
  dependencies: ['restoringAssetsAtom'],
  public: true,
}

export default restoringAssetsReportDefinition
