import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('names', () => {
  it('should return wallet account names', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    expect(selectors.walletAccounts.names(store.getState())).toEqual([])

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.names(store.getState())).toEqual([
      'exodus_0',
      'exodus_1',
      'trezor_abc',
      'ftx_0',
      'ledger_abc',
    ])
  })
})
