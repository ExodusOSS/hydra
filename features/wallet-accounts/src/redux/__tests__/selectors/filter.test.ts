import { WalletAccount } from '@exodus/models'

import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('filter', () => {
  test('should filter by supplied property', () => {
    const { store, selectors, emitWalletAccounts } = setup()
    const filterDisabled = () =>
      selectors.walletAccounts
        .filter({ enabled: false })(store.getState())
        .map((w) => w.toString())

    expect(filterDisabled()).toEqual([])

    emitWalletAccounts(WALLET_ACCOUNTS_STATE)
    expect(filterDisabled()).toEqual(['exodus_1'])
  })

  test('should filter by external property', () => {
    const { store, selectors, emitWalletAccounts } = setup()
    const filterByExternal = (external: boolean) =>
      selectors.walletAccounts
        .filter({ external })(store.getState())
        .map((w) => w.toString())

    emitWalletAccounts({
      [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
      polymarket_0: new WalletAccount({
        source: WalletAccount.POLYMARKET_SRC,
        index: 0,
        enabled: true,
      }),
    })

    expect(filterByExternal(true)).toEqual(['polymarket_0'])
    expect(filterByExternal(false)).toEqual([WalletAccount.DEFAULT_NAME])
  })
})
