import { createSelector } from 'reselect'
import { memoizeByAssetSource } from '@exodus/core-selectors/utils/memoize.js'

/**
 * Checks if a wallet account has "relative" tokens of the supplied asset (excluding itself):
 *
 * If providing a base asset, then it returns if the wallet has any child balance. Examples:
 * - eth, returns true if there is usdt(eth)
 * - tron, return true if there is usdt(tron)
 *
 * If providing child asset, then it returns if there is any base/parent or 'sister' assent with balance. Example:
 * - tfuel, return true if there is theta.
 *
 * This selector is useful when testing that the wallet is not drying up all the fuel token (relativeTokenName)
 * when holding other assets that require it to operate.
 *
 */

const selectorFactory = (isTxLogLoadedSelector, getAssetBalanceSelector, assetsSelector) =>
  memoizeByAssetSource(({ assetName, walletAccount }) =>
    createSelector(
      isTxLogLoadedSelector,
      getAssetBalanceSelector,
      assetsSelector,
      (isTxLogLoaded, getAssetBalance, assets) => {
        if (!isTxLogLoaded(walletAccount)) return false
        const asset = assets[assetName]
        if (!asset) {
          // not all assets are supported by Exodus.
          return false
        }

        const baseAssetName = asset.baseAsset.name
        const relatedAssets = Object.values(assets).filter(
          (asset) => asset.baseAsset.name === baseAssetName && asset.name !== assetName
        )
        // check that at least one token has non-zero balance
        return relatedAssets.some((token) => {
          const balance = getAssetBalance({
            assetName: token.name,
            walletAccount,
          })
          return balance && !balance.isZero
        })
      }
    )
  )

const createRequiresFuelThresholdSelectorDefinition = {
  id: 'createRequiresFuelThreshold',
  selectorFactory,
  dependencies: [
    { module: 'txLog', selector: 'createIsWalletAccountLoadedSelectorOld' },
    { module: 'balances', selector: 'getAssetSourceBalanceSelector' },
    { module: 'availableAssets', selector: 'all' },
  ],
}

export default createRequiresFuelThresholdSelectorDefinition
