import { connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { pick } from '@exodus/basic-utils'

import { setup } from '../utils'

const assets = connectAssets(_assets)
describe('createAssetConversionUsd', () => {
  const rates = {
    USD: {
      [assets.bitcoin.ticker]: {
        priceUSD: 60_000,
        price: 2000,
      },
    },
  }
  const assetsToEmit = pick(assets, ['ethereum', 'bitcoin'])

  const assertConversion = ({ cryptoAmount, expected }) => {
    const { store, selectors, emitRates, emitAssets } = setup({ currency: 'USD' })
    const selector = selectors.fiatBalances.createAssetConversionUsd

    emitAssets(assetsToEmit)
    emitRates(rates)

    const conversion = selector(assets.bitcoin.name)(store.getState())

    const input = assets.bitcoin.currency.defaultUnit(cryptoAmount)
    const output = conversion(input)

    expect(output.toDefaultNumber()).toEqual(expected)
  }

  it('should return function creating conversion for USD', () => {
    assertConversion({ cryptoAmount: 1, expected: 60_000 })
    assertConversion({ cryptoAmount: 0.5, expected: 30_000 })
    assertConversion({ cryptoAmount: 10, expected: 600_000 })
  })
})
