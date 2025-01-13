import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('enabled', () => {
  it('should return enabled wallet accounts', () => {
    const { store, selectors, enableMultipleWalletAccounts, emitWalletAccounts } = setup()

    enableMultipleWalletAccounts()
    expect(selectors.walletAccounts.enabled(store.getState())).toEqual([])

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.enabled(store.getState())).toEqual([
      'exodus_0',
      'trezor_abc',
      'ftx_0',
      'ledger_abc',
    ])
  })
})
