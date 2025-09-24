import { WalletAccount } from '@exodus/models'

import { setup } from '../utils.js'

describe('hasMaxAmountOfTrezorAccounts', () => {
  test('should return false if does not has max amount of accounts', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts({
      [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
      trezor_1: new WalletAccount({
        source: 'trezor',
        id: 1,
        index: 1,
        enabled: true,
      }),
    })

    expect(selectors.walletAccounts.hasMaxAmountOfTrezorAccounts(store.getState())).toEqual(false)
  })

  test('should return true if has max amount of accounts', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts({
      [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
      trezor_1: new WalletAccount({
        source: 'trezor',
        id: 1,
        index: 1,
        enabled: true,
      }),
      trezor_2: new WalletAccount({
        source: 'trezor',
        id: 2,
        index: 2,
        enabled: true,
      }),
      trezor_3: new WalletAccount({
        source: 'trezor',
        id: 3,
        index: 3,
        enabled: true,
      }),
    })

    expect(selectors.walletAccounts.hasMaxAmountOfTrezorAccounts(store.getState())).toEqual(true)
  })
})
