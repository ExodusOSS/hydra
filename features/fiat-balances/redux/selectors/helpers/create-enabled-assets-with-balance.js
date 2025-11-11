import { createSelector } from 'reselect'
import { isMultiNetworkAsset } from '../utils.js'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { groupBy } = lodash

const EMPTY = Object.freeze([])
const selectorFactory =
  (getIsEnabledAssetSelector, getIsUnverifiedTokenSelector, removedTokensSelector) =>
  ({ assetsListSelector }) =>
    createSelector(
      assetsListSelector,
      getIsEnabledAssetSelector,
      removedTokensSelector,
      getIsUnverifiedTokenSelector,
      (
        sortedAssetsWithBalance,
        getIsAssetEnabled,
        removedTokens = EMPTY,
        getIsUnverifiedCustomToken
      ) => {
        const assetsByNetwork = groupBy(sortedAssetsWithBalance, 'baseAsset.name')

        return (
          sortedAssetsWithBalance
            // filter top level array
            .filter((asset) => {
              if (removedTokens.includes(asset.name)) {
                return false
              }

              const getIsSomeNetworkAssetEnabled = () =>
                assetsByNetwork[asset.baseAsset.name].some((asset) => getIsAssetEnabled(asset))

              const unverifiedCustomTokenRule =
                getIsUnverifiedCustomToken &&
                getIsUnverifiedCustomToken(asset) &&
                getIsSomeNetworkAssetEnabled()

              const multiNetworkAssetRule =
                isMultiNetworkAsset(asset) &&
                asset.combinedAssets.some(
                  ({ name }) => getIsAssetEnabled(name) && !removedTokens.includes(name)
                )

              return (
                getIsAssetEnabled(asset.name) || multiNetworkAssetRule || unverifiedCustomTokenRule
              )
            })
            // filter combinedAssets, and if only one remains replace the multi-network asset with it
            .map((asset) => {
              if (!isMultiNetworkAsset(asset)) return asset

              const combinedAssets = asset.combinedAssets.filter(
                ({ name }) => getIsAssetEnabled(name) && !removedTokens.includes(name)
              )

              if (combinedAssets.length === 1) return combinedAssets[0]

              return {
                ...asset,
                combinedAssets,
              }
            })
        )
      }
    )

const createEnabledAssetsWithBalanceSelectorDefinition = {
  id: 'createEnabledAssetsWithBalance',
  selectorFactory,
  dependencies: [
    //
    { module: 'enabledAssets', selector: 'getIsEnabled' },
    { module: 'trustedUnverifiedTokens', selector: 'getIsUnverified', optional: true },
    { module: 'removedTokens', selector: 'data', optional: true },
  ],
}

export default createEnabledAssetsWithBalanceSelectorDefinition
