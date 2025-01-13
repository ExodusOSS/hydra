import { asset as bitcoin } from '@exodus/bitcoin-meta'

import { setup } from '../utils.js'

describe('createAssetSourceBalanceSelector', () => {
  test('returns balance by assetSource', () => {
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

    const result = bitcoin.currency.defaultUnit(10)
    expect(
      selectors.balances.createAssetSourceBalanceSelector({
        walletAccount: 'exodus_0',
        assetName: 'bitcoin',
      })(store.getState())
    ).toEqual(result)
  })
})
