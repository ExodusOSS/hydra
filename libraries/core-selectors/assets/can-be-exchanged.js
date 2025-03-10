import lodash from 'lodash'
import { createSelector } from 'reselect'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const createMultiNetworkSelector = memoize(
  ({ combinedAssetNames, walletAccount, createAssetCanBeExchangedSelector }) => {
    const selectors = combinedAssetNames.map((assetName) =>
      createAssetCanBeExchangedSelector({
        assetName,
        walletAccount,
      })
    )

    return createSelector(selectors, (...results) =>
      results.some((canBeExchanged) => !!canBeExchanged)
    )
  },
  ({ combinedAssetNames, walletAccount }) => `${combinedAssetNames.join('_')}_${walletAccount}`
)

export const createCombinedAssetCanBeExchangedSelectorCreator =
  ({ createAssetCanBeExchangedSelector, allAssetsSelector }) =>
  ({ walletAccount, assetName }) =>
  (state) => {
    const assets = allAssetsSelector(state)
    const isMultiNetwork = assets[assetName]?.assetType === 'MULTI_NETWORK_ASSET'
    if (isMultiNetwork) {
      const combinedAssetNames = assets[assetName].combinedAssetNames
      return createMultiNetworkSelector({
        combinedAssetNames,
        walletAccount,
        createAssetCanBeExchangedSelector,
      })(state)
    }

    return createAssetCanBeExchangedSelector({
      assetName,
      walletAccount,
    })(state)
  }
