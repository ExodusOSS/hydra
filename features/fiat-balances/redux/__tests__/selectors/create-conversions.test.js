import { connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { pick } from '@exodus/basic-utils'

import { setup } from '../utils.js'

const assets = connectAssets(_assets)
describe('createConversions', () => {
  const rates = {
    USD: {
      [assets.bitcoin.ticker]: {
        priceUSD: 2500,
        price: 2500,
      },
      [assets.ethereum.ticker]: {
        priceUSD: 1250,
        price: 1250,
      },
    },
    EUR: {
      [assets.bitcoin.ticker]: {
        priceUSD: 2500,
        price: 2000,
      },
      [assets.ethereum.ticker]: {
        priceUSD: 1250,
        price: 1000,
      },
    },
  }

  const assetsToEmit = pick(assets, ['ethereum', 'bitcoin'])

  let store
  let selectors

  beforeEach(() => {
    const { emitRates, emitAssets, ...rest } = setup({ currency: 'EUR' })

    emitAssets(assetsToEmit)
    emitRates(rates)

    store = rest.store
    selectors = rest.selectors
  })

  test('converts to USD', () => {
    const conversions = selectors.fiatBalances.createConversions('USD')(store.getState())

    expect(
      conversions.bitcoin(assets.bitcoin.currency.defaultUnit('2')).toDefaultString({ unit: true })
    ).toBe('5000 USD')

    expect(
      conversions
        .ethereum(assets.ethereum.currency.defaultUnit('2'))
        .toDefaultString({ unit: true })
    ).toBe('2500 USD')
  })
})
