import { WalletAccount } from '@exodus/models'

import { setup } from '../utils.js'

describe('getPathFriendlyName', () => {
  it('should replace invalid characters in accoutn name', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts({
      exodus_0: {
        ...WalletAccount.DEFAULT,
        label: 'some label',
      },
      exodus_1: {
        ...WalletAccount.DEFAULT,
        label: '#label',
      },
    })

    const selector = selectors.walletAccounts.getPathFriendlyName(store.getState())
    expect(selector('exodus_0')).toEqual('some_label')
    expect(selector('exodus_1')).toEqual('_label')
  })

  it('should lowercase account names', () => {
    const { store, selectors, emitWalletAccounts } = setup()

    emitWalletAccounts({
      exodus_0: {
        ...WalletAccount.DEFAULT,
        label: 'SomeLabel',
      },
    })

    expect(selectors.walletAccounts.getPathFriendlyName(store.getState())('exodus_0')).toEqual(
      'somelabel'
    )
  })
})
