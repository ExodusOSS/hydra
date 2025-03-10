import { createSelector } from 'reselect'

export const resultFunc = (orderSet, enabledWalletAccounts) => {
  const accountsSet = new Set(enabledWalletAccounts)

  return orderSet.filter(
    ({ fromWalletAccount, toWalletAccount }) =>
      accountsSet.has(fromWalletAccount) || accountsSet.has(toWalletAccount)
  )
}

const createAllOrdersInEnabledWalletAccountsSelector = ({
  orderSetSelector,
  allEnabledWalletAccountsSelector,
}) => createSelector(orderSetSelector, allEnabledWalletAccountsSelector, resultFunc)

export default createAllOrdersInEnabledWalletAccountsSelector
