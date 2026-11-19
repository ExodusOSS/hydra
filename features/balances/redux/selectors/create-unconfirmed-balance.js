// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'
import { getUnconfirmedBalance } from './get-unconfirmed-balance.js'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const selectorFactory = (createAssetSelector, createAssetSourceSelector) =>
  memoize(
    ({ assetName, walletAccount }) =>
      createSelector(
        createAssetSelector(assetName),
        createAssetSourceSelector({ assetName, walletAccount }),
        (asset, txs) => getUnconfirmedBalance({ asset, txs })
      ),
    ({ assetName, walletAccount }) => [assetName, walletAccount].join('-')
  )

const createUnconfirmedBalanceSelectorDefinition = {
  id: 'createUnconfirmedBalance',
  selectorFactory,
  dependencies: [
    { module: 'assets', selector: 'createAssetSelector' },
    { module: 'txLog', selector: 'createAssetSourceSelector' },
  ],
}

export default createUnconfirmedBalanceSelectorDefinition
