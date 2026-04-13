function createRemoteConfigAvailableCustomTokensPlugin({
  assetsModule,
  assetsConfigAtom,
  availableAssetNamesAtom,
  logger,
}) {
  let unsubscribe

  return {
    onStart: () => {
      unsubscribe = assetsConfigAtom.observe(async (assetsConfig) => {
        const assets = assetsModule.getAssets()
        const availableAssetNames = new Set(await availableAssetNamesAtom.get())
        const baseAssetNames = Object.values(assets)
          .filter(
            (asset) =>
              asset.name === asset.baseAsset.name && asset.baseAsset.api?.features?.customTokens
          )
          .map(({ name }) => name)

        const remoteCustomTokenNames = baseAssetNames
          .flatMap((baseAssetName) => assetsConfig?.[baseAssetName]?.customTokens || [])
          .filter((name) => !availableAssetNames.has(name))

        if (remoteCustomTokenNames.length > 0) {
          try {
            await assetsModule.addRemoteTokens({ tokenNames: remoteCustomTokenNames })
          } catch (error) {
            logger.warn('Failed to add tokens from remote config', remoteCustomTokenNames, error)
          }
        }
      })
    },
    onStop: () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    },
  }
}

const remoteConfigAvailableTokensPluginDefinition = {
  id: 'remoteConfigAvailableCustomTokensPlugin',
  type: 'plugin',
  factory: createRemoteConfigAvailableCustomTokensPlugin,
  dependencies: ['assetsModule', 'assetsConfigAtom', 'availableAssetNamesAtom', 'logger'],
}

export default remoteConfigAvailableTokensPluginDefinition
