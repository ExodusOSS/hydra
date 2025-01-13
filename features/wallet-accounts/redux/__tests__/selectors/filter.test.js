import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('filter', () => {
  test('should filter by supplied property', () => {
    const { store, selectors, emitWalletAccounts } = setup()
    const filterDisabled = () =>
      selectors.walletAccounts
        .filter({ enabled: false })(store.getState())
        .map((w) => w.toString())

    expect(filterDisabled()).toEqual([])

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    expect(filterDisabled()).toEqual(['exodus_1'])
  })
})
