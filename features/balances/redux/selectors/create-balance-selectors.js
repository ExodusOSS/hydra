import lodash from 'lodash'
import { MY_STATE } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const createBalanceSelectorFactory = ({ field, id }) => {
  const selectorFactory = (selfSelector) =>
    memoize(
      ({ assetName, walletAccount }) =>
        createSelector(
          selfSelector,
          (balances) => balances[walletAccount]?.data[assetName]?.[field]
        ),
      ({ assetName, walletAccount, field }) => [assetName, walletAccount, field].join('-')
    )

  return {
    id,
    selectorFactory,
    dependencies: [{ selector: MY_STATE }],
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
