import lodash from 'lodash'
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
import { WalletAccount } from '@exodus/models'

const { isEqual, isMatch, memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

// TODO: move to core-selectors
const createDeepEqualSelector = createSelectorCreator(defaultMemoize, (a, b) => {
  if (a === b) return true
  return isEqual(a, b)
})

// TODO: move to core-selectors
const createDeepEqualOutputSelector = (...args) => {
  const selector = createSelector(...args)
  return createDeepEqualSelector(selector, (result) => result)
}

const selectorFactory = (allWalletAccountInstancesSelector, activeWalletAccountSelector) =>
  memoize(
    (condition = {}) =>
      createDeepEqualOutputSelector(
        allWalletAccountInstancesSelector,
        activeWalletAccountSelector,
        (walletAccounts, activeWalletAccountName) => {
          return walletAccounts.filter((walletAccount) => {
            const status = {
              enabled: !!walletAccount.enabled,
              custodial: !!walletAccount.isCustodial,
              readOnly: !!(walletAccount.isHardware || walletAccount.is2FA),
              hardware: !!walletAccount.isHardware,
              ledger: walletAccount.source === WalletAccount.LEDGER_SRC,
              trezor: walletAccount.source === WalletAccount.TREZOR_SRC,
              '2FA': !!walletAccount.is2FA,
              active: walletAccount.toString() === activeWalletAccountName,
            }
            return isMatch(status, condition)
          })
        }
      ),
    (options) => JSON.stringify(options)
  )

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'filter',
  selectorFactory,
  dependencies: [
    // walletAccounts here corresponds to the id in the redux module declaration
    { selector: 'all' },
    { selector: 'active' },
  ],
}
