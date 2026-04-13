import { WalletAccount } from '@exodus/models'

import { setup, WALLET_ACCOUNTS_STATE } from '../utils.js'

describe('getExportPathName', () => {
  it('should return path friendly name if hardware wallet account', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts({
      exodus_0: {
        ...WALLET_ACCOUNTS_STATE.trezor_abc,
        label: 'Some Label',
      },
    })

    expect(selectors.walletAccounts.getExportPathName(store.getState())('exodus_0')).toEqual(
      'some_label'
    )
  })

  it('should return name if normal wallet account', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts({
      exodus_0: WalletAccount.DEFAULT,
    })

    expect(selectors.walletAccounts.getExportPathName(store.getState())('exodus_0')).toEqual(
      'exodus_0'
    )
  })
})
