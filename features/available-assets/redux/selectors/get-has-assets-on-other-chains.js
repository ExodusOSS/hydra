import { createGetHasAssetsOnOtherChainsSelector } from '@exodus/core-selectors/assets/networks/index.js'

const selectorFactory = (allAvailableAssetsSelector) =>
  createGetHasAssetsOnOtherChainsSelector({
    allAssetsSelector: allAvailableAssetsSelector,
  })

const getHasAssetsOnOtherChainsSelectorDefinition = {
  id: 'getHasAssetsOnOtherChains',
  selectorFactory,
  dependencies: [{ selector: 'all' }],
}

export default getHasAssetsOnOtherChainsSelectorDefinition
