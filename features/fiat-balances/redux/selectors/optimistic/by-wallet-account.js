import { createSelector } from 'reselect'
import { mapValues } from '@exodus/basic-utils'

const selectorFactory = (optimisticByWalletAccountSelector) =>
  createSelector(optimisticByWalletAccountSelector, (balancesByWalletAccount) =>
    mapValues(balancesByWalletAccount, (balances) => balances.balance)
  )

const optimisticByWalletAccountSelector = {
  id: 'optimisticByWalletAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'optimisticByWalletAccountField' },
  ],
}

export default optimisticByWalletAccountSelector
