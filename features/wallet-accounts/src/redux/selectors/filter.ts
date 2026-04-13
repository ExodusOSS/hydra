// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
import { WalletAccount } from '@exodus/models'
import type { WalletAccountsSelectors } from '../types.js'

const { isEqual, isMatch, memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

// TODO: move to core-selectors
const createDeepEqualSelector = createSelectorCreator(defaultMemoize, (a, b) => {
  if (a === b) return true
  return isEqual(a, b)
})

// TODO: move to core-selectors
// Reselect's createSelector typing doesn't support dynamic argument forwarding, requiring `any` casts here
const createDeepEqualOutputSelector = (...args: any[]) => {
  const selector = (createSelector as (...a: any[]) => any)(...args)
  return createDeepEqualSelector(selector, (result) => result)
}

const selectorFactory = (
  allWalletAccountInstancesSelector: WalletAccountsSelectors['all'],
  activeWalletAccountSelector: WalletAccountsSelectors['active']
) =>
  memoize(
    (condition: Record<string, boolean> = {}) =>
      createDeepEqualOutputSelector(
        allWalletAccountInstancesSelector,
        activeWalletAccountSelector,
        (walletAccounts: WalletAccount[], activeWalletAccountName: string) => {
          return walletAccounts.filter((walletAccount: WalletAccount) => {
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

export default {
  id: 'filter',
  selectorFactory,
  dependencies: [
    // walletAccounts here corresponds to the id in the redux module declaration
    { selector: 'all' },
    { selector: 'active' },
  ],
} as const
