import { createWithParentCombinedNetworkAssetsSelector } from '@exodus/core-selectors/assets/networks/index.js'

const selectorFactory = (allAvailableAssetsSelector) =>
  createWithParentCombinedNetworkAssetsSelector({
    allAssetsSelector: allAvailableAssetsSelector,
  })

const allWithParentCombinedNetworkSelectorDefinition = {
  id: 'allWithParentCombinedNetwork',
  selectorFactory,
  dependencies: [{ selector: 'all' }],
}

export default allWithParentCombinedNetworkSelectorDefinition
