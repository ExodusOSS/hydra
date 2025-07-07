import createLimitedAssetSourceSelectorDefinition from './create-limited-asset-source.js'
import createBatchedAssetSourceSelector from './create-batched-asset-source.js'
import createBatchedAssetSourceActivityByIdSelector from './create-batched-asset-source-by-id.js'
import createAssetSourceBaseActivitySelectorDefinition from './create-asset-source-base-activity.js'
import createWithNftsActivitySelectorDefinition from './create-with-nfts-activity.js'
import createWithFiatActivitySelectorDefinition from './create-with-fiat-activity.js'
import createWithConnectionsActivitySelectorDefinition from './create-with-connections-activity.js'
import createFullActivitySelectorDefinition from './create-full-activity.js'
import createMultiActivitySelectorDefinition from './create-multi-activity.js'

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
