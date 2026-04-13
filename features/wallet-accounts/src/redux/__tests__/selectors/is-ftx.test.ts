import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('isFTX', () => {
  it('should return true if wallet account has ftx source', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.isFTX(store.getState())('ftx_0')).toBeTruthy()
  })

  it('should return false if wallet account has a non-ftx source', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.isFTX(store.getState())('exodus_0')).toBeFalsy()
  })
})
