import { connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { pick } from '@exodus/basic-utils'

import { setup } from '../utils'

const assets = connectAssets(_assets)
describe('createConversion', () => {
  const rates = {
    USD: {
      [assets.ethereum.ticker]: {
        priceUSD: 2500,
        price: 2000,
      },
    },
    EUR: {
      [assets.ethereum.ticker]: {
        priceUSD: 2500,
        price: 2000,
      },
    },
  }
  const assetsToEmit = pick(assets, ['ethereum', 'bitcoin'])

  const assertEthConversion = ({ currency, expected }) => {
    const { store, selectors, emitRates, emitAssets } = setup({ currency })
    const selector = selectors.fiatBalances.createConversion

    emitAssets(assetsToEmit)
    emitRates(rates)

    const createConversion = selector(store.getState())
    const conversion = createConversion(assets.ethereum.name)

    const input = assets.ethereum.currency.defaultUnit(2)
    const output = conversion(input)

    expect(output.toDefaultNumber()).toEqual(expected)
  }

  it('should return function creating conversion for USD', () => {
    assertEthConversion({ currency: 'USD', expected: 5000 })
  })

  it('should return function creating conversion for EUR', () => {
    assertEthConversion({ currency: 'EUR', expected: 4000 })
  })
})
