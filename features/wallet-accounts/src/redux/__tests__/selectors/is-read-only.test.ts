import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('isReadOnly', () => {
  it('should return true if wallet account is hardware based', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.isReadOnly(store.getState())('trezor_abc')).toBeTruthy()
  })

  it('should return false if wallet account is software based', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.isReadOnly(store.getState())('ftx_0')).toBeFalsy()
  })
})
