// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { MY_STATE } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const createBalanceSelectorFactory = ({ field, id }) => {
  const selectorFactory = (createAssetSelector, selfSelector) =>
    memoize(
      ({ assetName, walletAccount }) =>
        createSelector(
          createAssetSelector(assetName),
          selfSelector,
          (asset, balances) =>
            balances[walletAccount]?.data[assetName]?.[field] ?? asset?.currency.ZERO
        ),
      ({ assetName, walletAccount, field }) => [assetName, walletAccount, field].join('-')
    )

  return {
    id,
    selectorFactory,
    dependencies: [{ module: 'assets', selector: 'createAssetSelector' }, { selector: MY_STATE }],
  }
}

const createBalanceSelectors = [
  // regenerate if there is a new balance field!!
  { id: 'createTotal', field: 'total' },
  { id: 'createBalance', field: 'balance' },
  { id: 'createSpendable', field: 'spendable' },
  { id: 'createSpendableBalance', field: 'spendableBalance' },
  { id: 'createUnconfirmedSent', field: 'unconfirmedSent' },
  { id: 'createUnconfirmedReceived', field: 'unconfirmedReceived' },
  { id: 'createUnspendable', field: 'unspendable' },
  { id: 'createWalletReserve', field: 'walletReserve' },
  { id: 'createNetworkReserve', field: 'networkReserve' },
  { id: 'createStaking', field: 'staking' },
  { id: 'createStaked', field: 'staked' },
  { id: 'createStakeable', field: 'stakeable' },
  { id: 'createUnstaking', field: 'unstaking' },
  { id: 'createUnstaked', field: 'unstaked' },
  { id: 'createRewards', field: 'rewards' },
  { id: 'createFrozen', field: 'frozen' },
].map(createBalanceSelectorFactory)

export default createBalanceSelectors
