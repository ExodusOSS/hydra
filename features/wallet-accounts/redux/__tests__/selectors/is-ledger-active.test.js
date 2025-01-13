import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('isLedgerActive', () => {
  it('should return true if active wallet account is a ledger device', () => {
    const { store, selectors, emitWalletAccounts, emitActiveWalletAccount } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    emitActiveWalletAccount('ledger_abc')

    expect(selectors.walletAccounts.isLedgerActive(store.getState())).toBeTruthy()
  })

  it('should return false if active wallet account is software based', () => {
    const { store, selectors, emitWalletAccounts, emitActiveWalletAccount } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    emitActiveWalletAccount('ftx_0')

    expect(selectors.walletAccounts.isLedgerActive(store.getState())).toBeFalsy()
  })
})
