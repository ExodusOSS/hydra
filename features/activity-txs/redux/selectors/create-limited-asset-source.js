import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'

const createLimitedAssetSourceSelectorDefinition = {
  id: 'createLimitedAssetSourceSelector',
  dependencies: [{ selector: 'createAssetSourceSelector' }],
  selectorFactory: (createAssetSourceSelector) =>
    memoize(
      ({ assetName, walletAccount, limit }) =>
        createSelector(createAssetSourceSelector({ assetName, walletAccount }), (txs) =>
          limit ? txs.slice(-limit) : txs
        ),
      ({ assetName, walletAccount, limit }) => `${assetName}_${walletAccount}_${limit}`
    ),
}

export default createLimitedAssetSourceSelectorDefinition
