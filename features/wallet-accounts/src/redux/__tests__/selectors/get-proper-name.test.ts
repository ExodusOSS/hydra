import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('getProperName[Memoized]', () => {
  it('should add suffix to accounts with same label', () => {
    const { store, selectors, enableMultipleWalletAccounts, emitWalletAccounts } = setup()

    enableMultipleWalletAccounts()
    emitWalletAccounts({
      ftx_0: {
        ...WALLET_ACCOUNTS_STATE.ftx_0,
        label: 'Same Label',
      },
      ftx_1: {
        ...WALLET_ACCOUNTS_STATE.ftx_0,
        label: 'Same Label',
      },
    })

    const state = store.getState()
    const args = ['ftx_1'] as const
    const expected = 'Same Label 1'
    expect(selectors.walletAccounts.getProperName(state)(...args)).toEqual(expected)
    expect(selectors.walletAccounts.createProperNameSelector(...args)(state)).toEqual(expected)
  })

  it('should truncate long labels', () => {
    const { store, selectors, enableMultipleWalletAccounts, emitWalletAccounts } = setup()

    enableMultipleWalletAccounts()
    emitWalletAccounts({
      ftx_0: {
        ...WALLET_ACCOUNTS_STATE.ftx_0,
        label: 'Same very long label',
      },
    })

    const state = store.getState()
    const args = ['ftx_0', { maxLength: 5 }] as const
    const expected = 'Same…'
    expect(selectors.walletAccounts.getProperName(state)(...args)).toEqual(expected)
    expect(selectors.walletAccounts.createProperNameSelector(...args)(state)).toEqual(expected)
  })

  it('should capitilize source if no label available', () => {
    const { store, selectors, enableMultipleWalletAccounts, emitWalletAccounts } = setup()

    enableMultipleWalletAccounts()
    emitWalletAccounts({
      ftx_0: WALLET_ACCOUNTS_STATE.ftx_0,
    })

    const state = store.getState()
    const args = ['ftx_0'] as const
    const expected = 'Ftx'
    expect(selectors.walletAccounts.getProperName(state)(...args)).toEqual(expected)
    expect(selectors.walletAccounts.createProperNameSelector(...args)(state)).toEqual(expected)
  })
})
