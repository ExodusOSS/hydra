import allSelectorDefinition from './all'
import createGetSelector from './get'
import hasNftsSelectorDefinition from './has-nfts'
import hasNftsByAssetNameSelectorDefinition from './has-nfts-by-asset-name'
import txsDataSelectorDefinition from './txs-data'
import txsByIdSelectorDefinition from './txs-by-id'
import activeNftsSelectorDefinition from './active-nfts'
import loadedSelectorDefinition from './loaded'
import createAssetSourceNftTxsByIdSelectorDefinition from './create-asset-source-nft-txs-by-id'
import createCollectionStatsSelectorDefinition from './create-collection-stats'

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
