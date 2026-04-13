import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('find', () => {
  it('should return first result for given wallet account', () => {
    const { store, selectors, enableMultipleWalletAccounts, emitWalletAccounts } = setup()

    enableMultipleWalletAccounts()
    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.find({ enabled: true })(store.getState())).toEqual(
      WALLET_ACCOUNTS_STATE.exodus_0
    )
  })
})
