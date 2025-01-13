import { WalletAccount } from '@exodus/models'

import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('active', () => {
  const dependencies = []

  it('should return active wallet account', () => {
    const activeWalletAccount = 'trezor_abc'
    const { store, selectors, emitWalletAccounts, emitActiveWalletAccount } = setup({
      dependencies,
    })

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    emitActiveWalletAccount(activeWalletAccount)

    expect(selectors.walletAccounts.active(store.getState())).toEqual('trezor_abc')
  })

  it('should return default wallet account when no active account', () => {
    const activeWalletAccount = undefined
    const { store, selectors, emitWalletAccounts, emitActiveWalletAccount } = setup({
      dependencies,
    })

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    emitActiveWalletAccount(activeWalletAccount)

    expect(selectors.walletAccounts.active(store.getState())).toEqual(WalletAccount.DEFAULT_NAME)
  })

  it('should return default wallet account when active account is not enabled', () => {
    const activeWalletAccount = 'trezor_abc'
    const { store, selectors, emitWalletAccounts, emitActiveWalletAccount } = setup({
      dependencies,
    })

    emitWalletAccounts({
      ...WALLET_ACCOUNTS_STATE,
      trezor_abc: {
        ...WALLET_ACCOUNTS_STATE.trezor_abc,
        enabled: false,
      },
    })

    emitActiveWalletAccount(activeWalletAccount)

    expect(selectors.walletAccounts.active(store.getState())).toEqual(WalletAccount.DEFAULT_NAME)
  })
})
