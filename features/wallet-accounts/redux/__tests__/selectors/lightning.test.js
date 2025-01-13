import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('createLightning', () => {
  it('should return wallet accounts that are lightning ones', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.createLightning('operation')(store.getState())).toEqual([
      'exodus_0',
      'trezor_abc',
    ])
  })

  it('should ignore read only wallet accounts when operation is deposit', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.createLightning('deposit')(store.getState())).toEqual([
      'exodus_0',
    ])
  })
})
