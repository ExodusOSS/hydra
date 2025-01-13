import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('nextIndex', () => {
  it('should return the next index for wallet accounts that have the default source', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)

    expect(selectors.walletAccounts.nextIndex(store.getState())).toEqual(2)
  })
})
