import createLimitedAssetSourceSelectorDefinition from './create-limited-asset-source'
import createBatchedAssetSourceSelector from './create-batched-asset-source'
import createBatchedAssetSourceActivityByIdSelector from './create-batched-asset-source-by-id'
import createAssetSourceBaseActivitySelectorDefinition from './create-asset-source-base-activity'
import createWithNftsActivitySelectorDefinition from './create-with-nfts-activity'
import createWithFiatActivitySelectorDefinition from './create-with-fiat-activity'
import createWithConnectionsActivitySelectorDefinition from './create-with-connections-activity'
import createFullActivitySelectorDefinition from './create-full-activity'
import createMultiActivitySelectorDefinition from './create-multi-activity'

export default [
  createLimitedAssetSourceSelectorDefinition,
  createBatchedAssetSourceSelector,
  createBatchedAssetSourceActivityByIdSelector,
  createAssetSourceBaseActivitySelectorDefinition,
  createWithNftsActivitySelectorDefinition,
  createWithFiatActivitySelectorDefinition,
  createWithConnectionsActivitySelectorDefinition,
  createFullActivitySelectorDefinition,
  createMultiActivitySelectorDefinition,
]
