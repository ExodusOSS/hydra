import allSelectorDefinition from './all.js'
import createGetSelector from './get.js'
import hasNftsSelectorDefinition from './has-nfts.js'
import hasNftsByAssetNameSelectorDefinition from './has-nfts-by-asset-name.js'
import txsDataSelectorDefinition from './txs-data.js'
import txsByIdSelectorDefinition from './txs-by-id.js'
import activeNftsSelectorDefinition from './active-nfts.js'
import loadedSelectorDefinition from './loaded.js'
import createAssetSourceNftTxsByIdSelectorDefinition from './create-asset-source-nft-txs-by-id.js'
import createCollectionStatsSelectorDefinition from './create-collection-stats.js'

export default [
  allSelectorDefinition,
  hasNftsSelectorDefinition,
  hasNftsByAssetNameSelectorDefinition,
  createGetSelector,
  txsDataSelectorDefinition,
  txsByIdSelectorDefinition,
  activeNftsSelectorDefinition,
  loadedSelectorDefinition,
  createAssetSourceNftTxsByIdSelectorDefinition,
  createCollectionStatsSelectorDefinition,
]
