import { WalletAccount } from '@exodus/models'

import { setup } from '../utils.js'

describe('hasMaxAmountOfAccounts', () => {
  test('should return false if does not has max amount of accounts', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts({ [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT })

    expect(selectors.walletAccounts.hasMaxAmountOfAccounts(store.getState())).toEqual(false)
  })

  test('should return true if has max amount of accounts', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts({
      [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
      exodus_1: new WalletAccount({
        source: 'exodus',
        index: 1,
        enabled: true,
      }),
      exodus_2: new WalletAccount({
        source: 'exodus',
        index: 1,
        enabled: true,
      }),
    })

    expect(selectors.walletAccounts.hasMaxAmountOfAccounts(store.getState())).toEqual(true)
  })

  test('should return true if has max amount of accounts with custom value', () => {
    const { store, selectors, emitWalletAccounts } = setup({ config: { maxAmountOfAccounts: 2 } })

    emitWalletAccounts({
      [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
      exodus_1: new WalletAccount({
        source: 'exodus',
        index: 1,
        enabled: true,
      }),
    })

    expect(selectors.walletAccounts.hasMaxAmountOfAccounts(store.getState())).toEqual(true)
  })
})
