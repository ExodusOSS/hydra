import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('loaded', () => {
  const dependencies = []

  it('should return loaded once all data is loaded', () => {
    const activeWalletAccount = 'exodus_1'
    const {
      store,
      selectors,
      emitWalletAccounts,
      emitActiveWalletAccount,
      enableMultipleWalletAccounts,
    } = setup({
      dependencies,
    })

    enableMultipleWalletAccounts()
    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    emitActiveWalletAccount(activeWalletAccount)

    expect(selectors.walletAccounts.loaded(store.getState())).toEqual(true)
  })
})
