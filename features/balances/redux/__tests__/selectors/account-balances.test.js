import { asset as bitcoin } from '@exodus/bitcoin-meta'

import { setup } from '../utils.js'

describe('createAccountAssetsBalanceSelector', () => {
  test(' return balances by asset source using balance field', () => {
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
      selectors.balances.createAccountAssetsBalanceSelector('exodus_0')(store.getState())
    ).toEqual(result)
  })
})
