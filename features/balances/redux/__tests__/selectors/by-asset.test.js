import { asset as bitcoin } from '@exodus/bitcoin-meta'

import { setup } from '../utils.js'

describe('byAsset', () => {
  let enabledWalletAccounts = ['exodus_0', 'exodus_1']
  let emitBalances, selectors, store

  beforeEach(() => {
    ;({ emitBalances, selectors, store } = setup({
      dependencies: [
        {
          id: 'walletAccounts.selectors.enabled',
          factory: () => () => enabledWalletAccounts,
          override: true,
        },
      ],
    }))
  })

  test('aggregates balances by asset accross enabled wallet accounts', () => {
    emitBalances({
      balances: {
        exodus_0: {
          bitcoin: {
            total: bitcoin.currency.defaultUnit(10),
            spendableBalance: bitcoin.currency.defaultUnit(5),
          },
          ethereum: {
            total: bitcoin.currency.defaultUnit(42),
          },
        },
        exodus_1: {
          bitcoin: {
            total: bitcoin.currency.defaultUnit(5),
          },
        },
      },
    })

    expect(selectors.balances.byAsset(store.getState())).toEqual({
      bitcoin: bitcoin.currency.defaultUnit(15),
      ethereum: bitcoin.currency.defaultUnit(42),
    })
  })

  test('omits balances from disabled wallet accounts', () => {
    enabledWalletAccounts = ['exodus_0']

    emitBalances({
      balances: {
        exodus_0: {
          bitcoin: {
            total: bitcoin.currency.defaultUnit(10),
            spendableBalance: bitcoin.currency.defaultUnit(5),
          },
          ethereum: {
            total: bitcoin.currency.defaultUnit(42),
          },
        },
        exodus_1: {
          bitcoin: {
            total: bitcoin.currency.defaultUnit(5),
          },
        },
      },
    })

    expect(selectors.balances.byAsset(store.getState())).toEqual({
      bitcoin: bitcoin.currency.defaultUnit(10),
      ethereum: bitcoin.currency.defaultUnit(42),
    })
  })
})
