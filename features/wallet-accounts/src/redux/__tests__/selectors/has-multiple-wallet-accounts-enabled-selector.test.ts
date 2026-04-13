import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('hasMultipleWalletAccountsEnabled', () => {
  test('should return true when more than one wallet account and feature enabled', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    expect(selectors.walletAccounts.multipleWalletAccountsEnabled(store.getState())).toEqual(true)

    expect(
      selectors.walletAccounts.hasMultipleWalletAccountsEnabledSelector(store.getState())
    ).toEqual(false)

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    expect(
      selectors.walletAccounts.hasMultipleWalletAccountsEnabledSelector(store.getState())
    ).toEqual(true)
  })
})
