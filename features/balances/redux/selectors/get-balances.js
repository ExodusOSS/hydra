import lodash from 'lodash'
import { createSelector } from 'reselect'
import { MY_STATE } from '@exodus/redux-dependency-injection'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const selectorFactory = (selfSelector) =>
  createSelector(selfSelector, (balances) =>
    memoize(
      ({ assetName, walletAccount }) => {
        return balances[walletAccount]?.data[assetName]
      },
      ({ assetName, walletAccount }) => [assetName, walletAccount].join('-')
    )
  )

const getBalancesSelectorDefinition = {
  id: 'getBalances',
  selectorFactory,
  dependencies: [{ selector: MY_STATE }],
}

export default getBalancesSelectorDefinition
