import { createGetCombinedAssetFallbackSelector } from '@exodus/core-selectors/assets/networks/index.js'

const selectorFactory = (allAvailableAssetsSelector) =>
  createGetCombinedAssetFallbackSelector({
    allAssetsSelector: allAvailableAssetsSelector,
  })

const getCombinedFallbackSelectorDefinition = {
  id: 'getCombinedFallback',
  selectorFactory,
  dependencies: [{ selector: 'all' }],
}

export default getCombinedFallbackSelectorDefinition
