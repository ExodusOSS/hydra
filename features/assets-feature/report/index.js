const createAssetsReport = ({
  assetsModule,
  assetPreferences,
  disabledPurposesAtom,
  multiAddressModeAtom,
  legacyAddressModeAtom,
  taprootAddressModeAtom,
}) => ({
  namespace: 'assets',
  export: async ({ walletExists } = Object.create(null)) => {
    if (!walletExists) return null

    const [disabledBipPurposes, multiAddressMode, legacyAddressMode, taprootAddressMode] =
      Promise.all([
        disabledPurposesAtom.get(),
        multiAddressModeAtom.get(),
        legacyAddressModeAtom.get(),
        taprootAddressModeAtom.get(),
      ])

    return {
      preferences: {
        disabledBipPurposes,
        multiAddressMode,
        legacyAddressMode,
        taprootAddressMode,
      },
    }
  },
})

const assetsReportDefinition = {
  id: 'assetsReport',
  type: 'report',
  factory: createAssetsReport,
  dependencies: [
    'assetsModule',
    'assetPreferences',
    'disabledPurposesAtom',
    'multiAddressModeAtom',
    'legacyAddressModeAtom',
    'taprootAddressModeAtom',
  ],
}

export default assetsReportDefinition
