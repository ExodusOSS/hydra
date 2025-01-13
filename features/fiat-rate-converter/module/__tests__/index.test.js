import { createAtomMock } from '@exodus/atoms'
import { UnitType } from '@exodus/currency'
import createFiatRateConverterDefinition from '../index.js'

const cryptoAmount = '5.290'
const DEFAULT_CURRENCY = 'USD'

const createFiatRateConverter = createFiatRateConverterDefinition.factory

function createAsset({ name, ticker, decimals = 9 }) {
  return {
    ticker,
    name,
    currency: UnitType.create({
      base: 0,
      [ticker]: decimals,
    }),
  }
}

const ethereum = createAsset({ ticker: 'ETH', name: 'ethereum' })
const unknownAsset = createAsset({ ticker: 'XYZ', name: 'unknown' })

const assets = { ethereum, unknownAsset }

describe('fiat-rate-converter', () => {
  const currencyAtom = createAtomMock({ defaultValue: 'USD' })
  const ratesAtom = createAtomMock({ defaultValue: {} })
  const ratesModule = createFiatRateConverter({
    currencyAtom,
    ratesAtom,
    config: {
      defaultCurrency: DEFAULT_CURRENCY,
    },
  })

  beforeAll(async () => {
    await ratesAtom.set({
      NGN: { ETH: { price: 544_448.57 } },
      USD: { ETH: { priceUSD: 1214.23 } },
    })
  })

  it('should convert an amount to the given fiat currency value', async () => {
    const fiatCurrency = 'NGN'
    const expectedFiatAmount = `2880132.9353 ${fiatCurrency}`

    const amount = await ratesModule.toFiatCurrency({
      amount: assets.ethereum.currency.defaultUnit(cryptoAmount),
      currency: fiatCurrency,
    })

    expect(amount.toDefaultString({ unit: true })).toEqual(expectedFiatAmount)
  })

  it('should convert an amount to the default fiat currency value', async () => {
    const expectedFiatAmount = `6423.2767 ${DEFAULT_CURRENCY}`

    const amount = await ratesModule.toFiatCurrency({
      amount: assets.ethereum.currency.defaultUnit(cryptoAmount),
    })

    expect(amount.toDefaultString({ unit: true })).toEqual(expectedFiatAmount)
  })

  it('should throw if an unknown currency conversion is requested', async () => {
    await expect(
      ratesModule.toFiatCurrency({
        amount: assets.ethereum.currency.defaultUnit(cryptoAmount),
        currency: 'XYZ',
      })
    ).rejects.toThrow()
  })

  it('should return zero if an invalid amount is used', async () => {
    await expect(
      ratesModule.toFiatCurrency({
        amount: cryptoAmount,
        currency: 'USD',
      })
    ).rejects.toThrow()
  })

  it('should return zero if an unkown asset is used', async () => {
    const amount = await ratesModule.toFiatCurrency({
      amount: assets.unknownAsset.currency.defaultUnit(cryptoAmount),
    })
    expect(amount.toDefaultNumber()).toEqual(0)
  })
})
