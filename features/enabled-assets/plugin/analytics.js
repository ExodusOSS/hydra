const createEnabledAssetsAnalyticsPlugin = ({ analytics, enabledAssetsAtom }) => {
  let unsubscribe

  const onStart = () => {
    analytics.requireDefaultEventProperties(['numberOfAssetsEnabled'])

    unsubscribe = enabledAssetsAtom.observe((enabledAssets) => {
      analytics.setDefaultEventProperties({
        numberOfAssetsEnabled: Object.keys(enabledAssets).length,
      })
    })
  }

  const onStop = () => unsubscribe()

  return { onStart, onStop }
}

const enabledAssetsAnalyticsPluginDefinition = {
  id: 'enabledAssetsAnalyticsPlugin',
  type: 'plugin',
  factory: createEnabledAssetsAnalyticsPlugin,
  dependencies: ['analytics', 'enabledAssetsAtom'],
  public: true,
}

export default enabledAssetsAnalyticsPluginDefinition
