import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('hardware', () => {
  it('should return all wallet account that are hardeware based', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.hardware(store.getState())).toEqual([
      'trezor_abc',
      'ledger_abc',
    ])
  })
})
