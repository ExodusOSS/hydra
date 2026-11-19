import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'

const EMPTY = Object.freeze([])

const createLimitedAssetSourceSelectorDefinition = {
  id: 'createLimitedAssetSourceSelector',
  dependencies: [{ selector: 'createAssetSourceSelector' }],
  selectorFactory: (createAssetSourceSelector) =>
    memoize(
      ({ assetName, walletAccount, limit }) =>
        createSelector(createAssetSourceSelector({ assetName, walletAccount }), (txs) => {
          // An asset missing from the registry makes the source selector return null (#44236).
          const source = txs ?? EMPTY
          return limit ? source.slice(-limit) : source
        }),
      ({ assetName, walletAccount, limit }) => `${assetName}_${walletAccount}_${limit}`
    ),
}

export default createLimitedAssetSourceSelectorDefinition
