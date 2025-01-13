import { asset as bitcoin } from '@exodus/bitcoin-meta'

import { setup } from '../utils.js'

describe('getAccountAssetsBalanceSelector', () => {
  test('return function that returns balances by asset source using balance field', () => {
    const { emitBalances, selectors, store } = setup()
    emitBalances({
      balances: {
        exodus_0: {
          bitcoin: {
            total: bitcoin.currency.defaultUnit(10),
            confirmedBalance: bitcoin.currency.defaultUnit(5),
          },
        },
      },
    })

    const result = {
      bitcoin: bitcoin.currency.defaultUnit(10),
    }

    expect(
      selectors.balances.getAccountAssetsBalanceSelector(store.getState())('exodus_0')
    ).toEqual(result)
  })
})
