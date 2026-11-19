import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('enabled', () => {
  it('should return enabled wallet accounts', () => {
    const { store, selectors, enableMultipleWalletAccounts, emitWalletAccounts } = setup()

    enableMultipleWalletAccounts()
    expect(selectors.walletAccounts.enabled(store.getState())).toEqual([])

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.enabled(store.getState())).toEqual([
      'exodus_0',
      'trezor_abc',
      'ftx_0',
      'ledger_abc',
    ])
  })

  it('should slice to first account when multipleWalletAccountsEnabled is false', () => {
    const { store, selectors, handleEvent, emitWalletAccounts } = setup()

    handleEvent('multipleWalletAccountsEnabled', false)
    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.enabled(store.getState())).toEqual(['exodus_0'])
  })

  it('should return all enabled accounts when multipleWalletAccountsEnabled is undefined', () => {
    const { store, selectors, handleEvent, emitWalletAccounts } = setup()

    // oxlint-disable-next-line unicorn/no-useless-undefined
    handleEvent('multipleWalletAccountsEnabled', undefined)
    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.enabled(store.getState())).toEqual([
      'exodus_0',
      'trezor_abc',
      'ftx_0',
      'ledger_abc',
    ])
  })
})
