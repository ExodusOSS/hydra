import { WalletAccount } from '@exodus/models'

import { setup } from '../utils.js'

describe('hasMaxAmountOfLedgerAccounts', () => {
  test('should return false if does not has max amount of accounts', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts({
      [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
      ledger_1: new WalletAccount({
        source: 'ledger',
        id: 1,
        index: 1,
        enabled: true,
      }),
    })

    expect(selectors.walletAccounts.hasMaxAmountOfLedgerAccounts(store.getState())).toEqual(false)
  })

  test('should return true if has max amount of accounts', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts({
      [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
      ledger_1: new WalletAccount({
        source: 'ledger',
        id: 1,
        index: 1,
        enabled: true,
      }),
      ledger_2: new WalletAccount({
        source: 'ledger',
        id: 2,
        index: 2,
        enabled: true,
      }),
      ledger_3: new WalletAccount({
        source: 'ledger',
        id: 3,
        index: 3,
        enabled: true,
      }),
    })

    expect(selectors.walletAccounts.hasMaxAmountOfLedgerAccounts(store.getState())).toEqual(true)
  })
})
