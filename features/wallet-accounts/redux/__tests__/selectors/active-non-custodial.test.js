import { WalletAccount } from '@exodus/models'

import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('activeNonCustodial', () => {
  const dependencies = []

  it('should return active wallet account', () => {
    const activeWalletAccount = 'trezor_abc'
    const { store, selectors, emitWalletAccounts, emitActiveWalletAccount } = setup({
      dependencies,
    })

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    emitActiveWalletAccount(activeWalletAccount)

    expect(selectors.walletAccounts.activeNonCustodial(store.getState())).toEqual(
      activeWalletAccount
    )
  })

  it('should return default wallet account when custodial active', () => {
    const activeWalletAccount = 'ftx_0'
    const { store, selectors, emitWalletAccounts, emitActiveWalletAccount } = setup({
      dependencies,
    })

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    emitActiveWalletAccount(activeWalletAccount)

    expect(selectors.walletAccounts.activeNonCustodial(store.getState())).toEqual(
      WalletAccount.DEFAULT_NAME
    )
  })
})
