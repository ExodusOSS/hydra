import lodash from 'lodash'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const createResultFunction = (field) => (getBalanceForField) =>
  memoize(
    ({ assetName, walletAccount }) => {
      return getBalanceForField({ assetName, walletAccount, field })
    },
    ({ assetName, walletAccount }) => [assetName, walletAccount].join('-')
  )

const getBalanceSelectorFactory = ({ field, id }) => {
  return {
    id,
    resultFunction: createResultFunction(field),
    dependencies: [{ module: 'balances', selector: 'getBalanceForField' }],
  }
}

const getBalanceSelectors = [
  // regenerate if there is a new balance field!!
  { id: 'getTotal', field: 'total' },
  { id: 'getBalance', field: 'balance' },
  { id: 'getSpendable', field: 'spendable' },
  { id: 'getSpendableBalance', field: 'spendableBalance' },
  { id: 'getUnconfirmedSent', field: 'unconfirmedSent' },
  { id: 'getUnconfirmedReceived', field: 'unconfirmedReceived' },
  { id: 'getUnspendable', field: 'unspendable' },
  { id: 'getWalletReserve', field: 'walletReserve' },
  { id: 'getNetworkReserve', field: 'networkReserve' },
  { id: 'getStaking', field: 'staking' },
  { id: 'getStaked', field: 'staked' },
  { id: 'getStakable', field: 'stakable' },
  { id: 'getUnstaking', field: 'unstaking' },
  { id: 'getUnstaked', field: 'unstaked' },
  { id: 'getRewards', field: 'rewards' },
  { id: 'getFrozen', field: 'frozen' },
].map(getBalanceSelectorFactory)

export default getBalanceSelectors
