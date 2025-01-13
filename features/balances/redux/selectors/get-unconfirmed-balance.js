import lodash from 'lodash'
import { createSelector } from 'reselect'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

export const getUnconfirmedBalance = ({ asset, txs }) => {
  let result = asset.currency.ZERO

  for (const tx of txs) {
    const isIncommingTX = !tx.sent
    const isUnconfirmed = !tx.failed && tx.pending

    if (isUnconfirmed && isIncommingTX) {
      result = result.add(tx.coinAmount)
    }
  }

  return result
}

const selectorFactory = (assetsSelector, createAssetSourceSelector) =>
  createSelector(assetsSelector, createAssetSourceSelector, (assets, getTxs) =>
    memoize(
      ({ assetName, walletAccount }) =>
        getUnconfirmedBalance({
          asset: assets[assetName],
          txs: getTxs({ assetName, walletAccount }),
        }),
      ({ assetName, walletAccount }) => [assetName, walletAccount].join('-')
    )
  )

const getUnconfirmedBalanceSelectorDefinition = {
  id: 'getUnconfirmedBalance',
  selectorFactory,
  dependencies: [
    { module: 'assets', selector: 'all' },
    { module: 'txLog', selector: 'createAssetSourceSelectorOld' },
  ],
}

export default getUnconfirmedBalanceSelectorDefinition
