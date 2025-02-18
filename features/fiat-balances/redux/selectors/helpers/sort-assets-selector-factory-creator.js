import { keyBy, memoize, orderBy } from '@exodus/basic-utils'
import { isDustAmount } from '@exodus/formatting/lib/asset'
import { createSelector } from 'reselect'
import { isMultiNetworkAsset } from '../utils'

const SORTING_MAP = [
  [(a) => a.sortAssetMetaData.fiatBalance && a.sortAssetMetaData.isFavoriteAsset, 'desc'],
  [(a) => a.sortAssetMetaData.fiatBalance, 'desc'],
  [(a) => a.sortAssetMetaData.isFavoriteAsset, 'desc'],
  [(a) => a.sortAssetMetaData.isBaseAsset, 'desc'],
  [(a) => a.sortAssetMetaData.hasBalance, 'desc'],
  [(a) => a.sortAssetMetaData.isDust, 'asc'],
  [(a) => a.sortAssetMetaData.cap, 'desc'],
]

const SORT_KEYS = SORTING_MAP.map((o) => o[0])
const SORT_ORDER = SORTING_MAP.map((o) => o[1])

const sortAssetsSelectorFactoryCreator = ({
  fiatBalancesByAssetSourceSelector,
  getAccountAssetsBalanceSelector,
  ratesSelector,
  getIsFavoriteAssetSelector,
  ignoreMarketCapAssets,
  assetsListSelector,
}) =>
  memoize((walletAccount) => {
    let lastResult
    return createSelector(
      assetsListSelector,
      (state) => getAccountAssetsBalanceSelector(state)(walletAccount),
      (state) => fiatBalancesByAssetSourceSelector(state)[walletAccount],
      ratesSelector,
      getIsFavoriteAssetSelector,
      (assetsList, balances, fiatBalances, rates, getIsAssetFavorite) => {
        const assetsListWithSingleCombined = assetsList.map((asset) =>
          isMultiNetworkAsset(asset) && asset.combinedAssets.length === 1
            ? asset.combinedAssets[0]
            : asset
        )

        const assetsMap = keyBy(assetsListWithSingleCombined, 'name')
        const assetsWithMetaData = assetsListWithSingleCombined.map((asset) => {
          const cap = isMultiNetworkAsset(asset)
            ? rates[asset.combinedAssets[0]?.ticker]?.cap
            : rates[asset.ticker]?.cap

          const getAssetBalanceNumber = (assetName) => balances?.[assetName]?.toDefaultNumber() ?? 0
          const getAssetFiatBalanceNumber = (assetName) =>
            fiatBalances?.[assetName]?.toDefaultNumber() ?? 0

          const balance = isMultiNetworkAsset(asset)
            ? asset.combinedAssetNames.reduce((acc, assetName) => {
                const assetFiatBalance = getAssetBalanceNumber(assetName)
                acc += assetFiatBalance
                return acc
              }, 0)
            : getAssetBalanceNumber(asset.name)

          const fiatBalance = isMultiNetworkAsset(asset)
            ? asset.combinedAssetNames.reduce((acc, assetName) => {
                const assetFiatBalance = getAssetFiatBalanceNumber(assetName)
                acc += assetFiatBalance
                return acc
              }, 0)
            : getAssetFiatBalanceNumber(asset.name)

          return {
            ...asset,
            sortAssetMetaData: {
              isFavoriteAsset: getIsAssetFavorite(asset.name),
              isBaseAsset: asset.baseAsset.name === asset.name,
              fiatBalance,
              hasBalance: balance > 0,
              isDust: isDustAmount(balance),
              cap: (!ignoreMarketCapAssets.includes(asset.baseAsset.name) && cap) || 0,
            },
          }
        })

        const sorted = orderBy(assetsWithMetaData, SORT_KEYS, SORT_ORDER)
        const namesOnly = sorted.map((assetWithMetaData) => assetWithMetaData.name)
        const lastSortedAssetNames = lastResult ? lastResult.map((a) => a.name) : null
        // Compare newResult with lastResult for reference equality
        if (
          lastSortedAssetNames &&
          namesOnly.length === lastSortedAssetNames.length &&
          namesOnly.every((item, i) => item === lastSortedAssetNames[i])
        ) {
          return lastResult
        }

        lastResult = sorted.map((assetWithMetaData) => assetsMap[assetWithMetaData.name])

        return lastResult
      }
    )
  })

export default sortAssetsSelectorFactoryCreator
