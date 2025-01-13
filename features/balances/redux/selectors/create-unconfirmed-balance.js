import lodash from 'lodash'
import { createSelector } from 'reselect'
import { getUnconfirmedBalance } from './get-unconfirmed-balance.js'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const selectorFactory = (assetsSelector, createAssetSourceSelector) =>
  memoize(
    ({ assetName, walletAccount }) =>
      createSelector(
        assetsSelector,
        createAssetSourceSelector({ assetName, walletAccount }),
        (assets, txs) => getUnconfirmedBalance({ asset: assets[assetName], txs })
      ),
    ({ assetName, walletAccount }) => [assetName, walletAccount].join('-')
  )

const createUnconfirmedBalanceSelectorDefinition = {
  id: 'createUnconfirmedBalance',
  selectorFactory,
  dependencies: [
    { module: 'assets', selector: 'all' },
    { module: 'txLog', selector: 'createAssetSourceSelector' },
  ],
}

export default createUnconfirmedBalanceSelectorDefinition
