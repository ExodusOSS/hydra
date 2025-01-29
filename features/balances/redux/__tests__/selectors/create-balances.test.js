import { asset as bitcoin } from '@exodus/bitcoin-meta'

import { setup } from '../utils.js'

describe('createBalances', () => {
  let emitBalances, selectors, store

  beforeEach(() => {
    ;({ emitBalances, selectors, store } = setup({}))
  })

  test('get bitcoin and exodus_0 balances', () => {
    emitBalances({
      balances: {
        exodus_0: {
          bitcoin: {
            balance: bitcoin.currency.defaultUnit(10),
            total: bitcoin.currency.defaultUnit(10),
            spendableBalance: bitcoin.currency.defaultUnit(5),
            spendable: bitcoin.currency.defaultUnit(5),
          },
          ethereum: {
            balance: bitcoin.currency.defaultUnit(42),
            total: bitcoin.currency.defaultUnit(42),
          },
        },
        exodus_1: {
          bitcoin: {
            balance: bitcoin.currency.defaultUnit(5),
            spendable: bitcoin.currency.defaultUnit(5),
          },
        },
      },
    })

    const result = selectors.balances.createBalances({
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
    })(store.getState())
    expect(result).toEqual({
      balance: bitcoin.currency.defaultUnit(10),
      total: bitcoin.currency.defaultUnit(10),
      spendableBalance: bitcoin.currency.defaultUnit(5),
      spendable: bitcoin.currency.defaultUnit(5),
    })
  })
})
