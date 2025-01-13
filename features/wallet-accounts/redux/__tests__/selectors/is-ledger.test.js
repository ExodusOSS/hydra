import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('isLedger', () => {
  it('should return true if wallet account is a ledger device', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.isLedger(store.getState())('ledger_abc')).toBeTruthy()
  })

  it('should return false if wallet account is software based', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.isLedger(store.getState())('ftx_0')).toBeFalsy()
  })
})
