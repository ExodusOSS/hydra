import { createWithoutParentCombinedNetworkAssetsSelector } from '@exodus/core-selectors/assets/networks/index.js'

const selectorFactory = (allAvailableAssetsSelector) =>
  createWithoutParentCombinedNetworkAssetsSelector({
    allAssetsSelector: allAvailableAssetsSelector,
  })

const allWithoutParentCombinedNetworkSelectorDefinition = {
  id: 'allWithoutParentCombinedNetwork',
  selectorFactory,
  dependencies: [{ selector: 'all' }],
}

export default allWithoutParentCombinedNetworkSelectorDefinition
