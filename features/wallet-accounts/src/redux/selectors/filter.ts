// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { defineSelectorFactory } from '@exodus/redux-dependency-injection'
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
import { WalletAccount } from '@exodus/models'
import type { WalletAccountsSelectors } from '../types.js'

const { isEqual, isMatch, memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

// TODO: move to core-selectors
const createDeepEqualSelector = createSelectorCreator(defaultMemoize, (a, b) => {
  if (a === b) return true
  return isEqual(a, b)
})

// TODO: move to core-selectors
const createDeepEqualOutputSelector = <A, B, R>(
  selectorA: (state: unknown) => A,
  selectorB: (state: unknown) => B,
  combiner: (a: A, b: B) => R
): ((state: unknown) => R) => {
  const inner = createSelector(selectorA, selectorB, combiner)
  return createDeepEqualSelector(inner, (result: R): R => result)
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
        (walletAccounts: WalletAccount[], activeWalletAccountName: string): WalletAccount[] => {
          return walletAccounts.filter((walletAccount: WalletAccount) => {
            const status = {
              enabled: !!walletAccount.enabled,
              custodial: !!walletAccount.isCustodial,
              external: !!walletAccount.isExternal,
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

export default defineSelectorFactory({
  id: 'filter',
  selectorFactory,
  dependencies: [
    // walletAccounts here corresponds to the id in the redux module declaration
    { selector: 'all' },
    { selector: 'active' },
  ],
})
