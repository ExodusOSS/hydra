import { mapValues, pick } from '@exodus/basic-utils'

const resultFunction = (assets, availableAssetNames) => {
  const availableAssets = pick(assets, [...availableAssetNames])

  return mapValues(availableAssets, (asset) => {
    if (!asset.isCombined) return asset

    const combinedAssets = asset.combinedAssets.filter((asset) =>
      availableAssetNames.has(asset.name)
    )

    const combinedAssetNames = combinedAssets.map((asset) => asset.name)

    return { ...asset, combinedAssets, combinedAssetNames }
  })
}

const allSelectorDefinition = {
  id: 'all',
  resultFunction,
  dependencies: [
    //
    { module: 'assets', selector: 'all' },
    { selector: 'data' },
  ],
}

export default allSelectorDefinition
