import { createSelector } from 'reselect'
import { OrderSet } from '@exodus/models'

export const resultFunc = (orderSet, enabledWalletAccounts) => {
  const accountsSet = new Set(enabledWalletAccounts)
  const relevant = [...orderSet].filter(
    ({ fromWalletAccount, toWalletAccount }) =>
      accountsSet.has(fromWalletAccount) || accountsSet.has(toWalletAccount)
  )

  return OrderSet.fromArray(relevant)
}

const createAllOrdersInEnabledWalletAccountsSelector = ({
  orderSetSelector,
  allEnabledWalletAccountsSelector,
}) => createSelector(orderSetSelector, allEnabledWalletAccountsSelector, resultFunc)

export default createAllOrdersInEnabledWalletAccountsSelector
