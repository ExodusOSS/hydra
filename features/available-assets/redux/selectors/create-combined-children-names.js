import { createCreateCombinedAssetChildrenNamesSelector } from '@exodus/core-selectors/assets/networks/index.js'

const selectorFactory = (allAvailableAssetsSelector) =>
  createCreateCombinedAssetChildrenNamesSelector({
    allAssetsSelector: allAvailableAssetsSelector,
  })

const createCombinedChildrenNamesSelectorDefinition = {
  id: 'createCombinedChildrenNames',
  selectorFactory,
  dependencies: [{ selector: 'all' }],
}

export default createCombinedChildrenNamesSelectorDefinition
