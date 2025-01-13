import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('activeIsCustodial', () => {
  const dependencies = []

  it('should return false for hardware wallet', () => {
    const activeWalletAccount = 'trezor_abc'
    const { store, selectors, emitWalletAccounts, emitActiveWalletAccount } = setup({
      dependencies,
    })

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    emitActiveWalletAccount(activeWalletAccount)

    expect(selectors.walletAccounts.activeIsCustodial(store.getState())).toEqual(false)
  })

  it('should return false for default wallet account', () => {
    const { store, selectors, emitWalletAccounts } = setup({ dependencies })

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.activeIsCustodial(store.getState())).toEqual(false)
  })

  it('should return true for custodial account', () => {
    const activeWalletAccount = 'ftx_0'
    const { store, selectors, emitWalletAccounts, emitActiveWalletAccount } = setup({
      dependencies,
    })

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    emitActiveWalletAccount(activeWalletAccount)

    expect(selectors.walletAccounts.activeIsCustodial(store.getState())).toEqual(true)
  })
})
