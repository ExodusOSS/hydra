import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('isReadOnlyActive', () => {
  it('should return true if active wallet account is hardware based', () => {
    const { store, selectors, emitWalletAccounts, emitActiveWalletAccount } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    emitActiveWalletAccount('trezor_abc')

    expect(selectors.walletAccounts.isReadOnlyActive(store.getState())).toBeTruthy()
  })

  it('should return false if active wallet account is software based', () => {
    const { store, selectors, emitWalletAccounts, emitActiveWalletAccount } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    emitActiveWalletAccount('ftx_0')

    expect(selectors.walletAccounts.isReadOnlyActive(store.getState())).toBeFalsy()
  })
})
