import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('allNonCustodial', () => {
  it('should return non-custodial wallet account only', () => {
    const { store, selectors, enableMultipleWalletAccounts, emitWalletAccounts } = setup()

    enableMultipleWalletAccounts()
    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.allNonCustodial(store.getState())).toEqual([
      'exodus_0',
      'exodus_1',
      'trezor_abc',
      'ledger_abc',
    ])
  })
})
