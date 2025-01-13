import { createGetParentCombinedAssetSelector } from '@exodus/core-selectors/assets/networks/index.js'

const selectorFactory = (allAvailableAssetsSelector) =>
  createGetParentCombinedAssetSelector({
    allAssetsSelector: allAvailableAssetsSelector,
  })

const getParentCombinedSelector = {
  id: 'getParentCombined',
  selectorFactory,
  dependencies: [{ selector: 'all' }],
}

export default getParentCombinedSelector
